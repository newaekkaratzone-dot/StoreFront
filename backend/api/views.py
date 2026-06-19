from rest_framework import generics, viewsets, status, views, permissions, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.db.models import F, Sum, Count
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta
from .models import User, SellerProfile, Product, Cart, CartItem, Order, OrderItem
from .serializers import (
    UserSerializer, SellerProfileSerializer, ProductSerializer, CartSerializer, 
    CartItemSerializer, OrderSerializer, OrderItemSerializer, CustomTokenObtainPairSerializer
)
from .permissions import IsSeller, IsBuyer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {'unit_price': ['gte', 'lte'], 'status': ['exact']}
    search_fields = ['title', 'description', 'seller__store_name']
    ordering_fields = ['unit_price', 'created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsSeller()]
        return [permissions.AllowAny()] # Anyone can view products

    def perform_create(self, serializer):
        # Assign to the logged-in seller
        serializer.save(seller=self.request.user.seller_profile)
        
    def get_queryset(self):
        queryset = super().get_queryset()
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        # If buyer or anonymous, maybe only show active products
        if not self.request.user.is_authenticated or self.request.user.role != 'seller':
            queryset = queryset.filter(status='active')
        return queryset

class CartView(views.APIView):
    permission_classes = [IsBuyer]

    def get(self, request):
        cart = request.user.cart
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def post(self, request):
        """Add item to cart"""
        cart = request.user.cart
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        try:
            product = Product.objects.get(id=product_id, status='active')
        except Product.DoesNotExist:
            return Response({'error': 'Product not found or inactive'}, status=status.HTTP_404_NOT_FOUND)

        if quantity <= 0:
            return Response({'error': 'Quantity must be greater than 0'}, status=status.HTTP_400_BAD_REQUEST)

        if quantity > product.quantity:
            return Response({'error': 'Not enough stock available'}, status=status.HTTP_400_BAD_REQUEST)

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart, product=product,
            defaults={'quantity': quantity}
        )
        if not created:
            if cart_item.quantity + quantity > product.quantity:
                return Response({'error': 'Not enough stock available'}, status=status.HTTP_400_BAD_REQUEST)
            cart_item.quantity += quantity
            cart_item.save()

        return Response(CartItemSerializer(cart_item).data, status=status.HTTP_201_CREATED)

    def delete(self, request):
        """Remove item from cart"""
        cart_item_id = request.data.get('cart_item_id')
        product_id = request.data.get('product_id')
        try:
            if cart_item_id:
                cart_item = CartItem.objects.get(id=cart_item_id, cart=request.user.cart)
            elif product_id:
                cart_item = CartItem.objects.get(product_id=product_id, cart=request.user.cart)
            else:
                return Response({'error': 'Must provide cart_item_id or product_id'}, status=status.HTTP_400_BAD_REQUEST)
            
            cart_item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CartItem.DoesNotExist:
            return Response({'error': 'Item not found in cart'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request):
        """Update cart item quantity"""
        cart_item_id = request.data.get('cart_item_id')
        quantity = int(request.data.get('quantity', 1))
        
        try:
            cart_item = CartItem.objects.get(id=cart_item_id, cart=request.user.cart)
            if quantity <= 0:
                cart_item.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            
            if quantity > cart_item.product.quantity:
                return Response({'error': 'Not enough stock available'}, status=status.HTTP_400_BAD_REQUEST)
                
            cart_item.quantity = quantity
            cart_item.save()
            return Response(CartItemSerializer(cart_item).data, status=status.HTTP_200_OK)
        except CartItem.DoesNotExist:
            return Response({'error': 'Item not found in cart'}, status=status.HTTP_404_NOT_FOUND)

class CheckoutView(views.APIView):
    permission_classes = [IsBuyer]

    def post(self, request):
        cart = request.user.cart
        cart_items = cart.items.select_related('product').all()

        if not cart_items.exists():
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        shipping_address = request.data.get('shipping_address')
        if not shipping_address:
            return Response({'error': 'Shipping address is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                # 1. Calculate total and create Order
                total_amount = sum(item.quantity * item.product.unit_price for item in cart_items)
                
                order = Order.objects.create(
                    buyer=request.user,
                    status='confirmed',
                    total_amount=total_amount,
                    shipping_address=shipping_address,
                    payment_method=request.data.get('payment_method'),
                    note=request.data.get('note')
                )

                # 2. Create OrderItems and reduce Product stock
                for item in cart_items:
                    # Select for update to prevent race conditions
                    product = Product.objects.select_for_update().get(id=item.product.id)
                    
                    if product.quantity < item.quantity:
                        raise ValueError(f"Not enough stock for {product.title}")
                    
                    subtotal = item.quantity * product.unit_price
                    
                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        quantity=item.quantity,
                        unit_price=product.unit_price, # Snapshot price
                        subtotal=subtotal
                    )
                    
                    # Reduce stock
                    product.quantity = F('quantity') - item.quantity
                    product.save()

                # 3. Clear cart
                cart_items.delete()

            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'buyer':
            return Order.objects.filter(buyer=user).prefetch_related('items__product')
        elif user.role == 'seller':
            # Sellers might need to see orders containing their products (complex, skipping for now, 
            # assignment mostly focuses on buyers placing orders)
            return Order.objects.none()
        return Order.objects.none()

class SellerProfileView(views.APIView):
    permission_classes = [IsSeller]

    def get(self, request):
        profile = request.user.seller_profile
        serializer = SellerProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        profile = request.user.seller_profile
        serializer = SellerProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SellerAnalyticsView(views.APIView):
    permission_classes = [IsSeller]

    def get(self, request):
        seller = request.user.seller_profile
        
        # Total metrics
        products = Product.objects.filter(seller=seller)
        total_products = products.count()
        
        order_items = OrderItem.objects.filter(product__seller=seller)
        total_revenue = order_items.aggregate(total=Sum('subtotal'))['total'] or 0
        total_orders = order_items.values('order').distinct().count()

        # Last 7 days sales
        seven_days_ago = timezone.now() - timedelta(days=7)
        recent_sales = order_items.filter(order__ordered_at__gte=seven_days_ago) \
            .annotate(date=TruncDate('order__ordered_at')) \
            .values('date') \
            .annotate(revenue=Sum('subtotal')) \
            .order_by('date')
            
        # Format sales data for recharts
        sales_data = []
        for i in range(6, -1, -1):
            date = (timezone.now() - timedelta(days=i)).date()
            revenue = next((item['revenue'] for item in recent_sales if item['date'] == date), 0)
            sales_data.append({
                'date': date.strftime('%a'),
                'revenue': float(revenue)
            })

        # Top selling products
        top_selling = list(order_items.values('product__id', 'product__title')
            .annotate(total_sold=Sum('quantity'))
            .order_by('-total_sold')[:5])

        # Low stock products (quantity < 10)
        low_stock = list(products.filter(quantity__lt=10, status='active')
            .values('id', 'title', 'quantity')
            .order_by('quantity')[:5])

        return Response({
            'total_products': total_products,
            'total_revenue': float(total_revenue),
            'total_orders': total_orders,
            'sales_data': sales_data,
            'top_selling': top_selling,
            'low_stock': low_stock
        })

class ImageUploadView(APIView):
    """Upload an image file and return its public URL."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        image_file = request.FILES.get('image')
        if not image_file:
            return Response({'error': 'No image file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if image_file.content_type not in allowed_types:
            return Response({'error': 'Invalid file type. Allowed: JPEG, PNG, WEBP, GIF.'}, status=status.HTTP_400_BAD_REQUEST)

        max_size = 5 * 1024 * 1024  # 5 MB
        if image_file.size > max_size:
            return Response({'error': 'File too large. Maximum size is 5 MB.'}, status=status.HTTP_400_BAD_REQUEST)

        import os, uuid
        from django.conf import settings as django_settings
        ext = os.path.splitext(image_file.name)[1].lower()
        filename = f"{uuid.uuid4().hex}{ext}"
        upload_dir = os.path.join(django_settings.MEDIA_ROOT, 'products')
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, filename)

        with open(file_path, 'wb+') as dest:
            for chunk in image_file.chunks():
                dest.write(chunk)

        # Build absolute URL
        request_obj = request._request if hasattr(request, '_request') else request
        base_url = f"{request_obj.scheme}://{request_obj.get_host()}"
        image_url = f"{base_url}{django_settings.MEDIA_URL}products/{filename}"
        return Response({'url': image_url}, status=status.HTTP_201_CREATED)

