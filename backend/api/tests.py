import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import User, Product, CartItem, SellerProfile, Cart

@pytest.mark.django_db
class TestStoreFrontAPI:
    def setup_method(self):
        self.client = APIClient()
        # Create seller
        self.seller = User.objects.create_user(
            username='seller1', 
            password='password123', 
            role='seller',
            email='seller@example.com'
        )
        SellerProfile.objects.create(user=self.seller, store_name="Seller Store")

        # Create buyer
        self.buyer = User.objects.create_user(
            username='buyer1', 
            password='password123', 
            role='buyer',
            email='buyer@example.com'
        )
        Cart.objects.create(buyer=self.buyer)

    def test_user_registration(self):
        url = reverse('register')
        data = {
            'username': 'buyer2',
            'password': 'password123',
            'email': 'buyer2@example.com',
            'role': 'buyer'
        }
        response = self.client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert User.objects.filter(username='buyer2').exists()

    def test_seller_can_create_product(self):
        self.client.force_authenticate(user=self.seller)
        url = reverse('product-list')
        data = {
            'title': 'Test Product',
            'description': 'Description',
            'unit_price': '10.00',
            'quantity': 100,
            'status': 'active',
            'thumbnail_url': 'http://example.com/thumb.jpg'
        }
        response = self.client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert Product.objects.count() == 1

    def test_buyer_cannot_create_product(self):
        self.client.force_authenticate(user=self.buyer)
        url = reverse('product-list')
        data = {
            'title': 'Test Product',
            'description': 'Description',
            'unit_price': '10.00',
            'quantity': 100,
            'status': 'active',
            'thumbnail_url': 'http://example.com/thumb.jpg'
        }
        response = self.client.post(url, data)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_buyer_can_checkout(self):
        # Setup product
        product = Product.objects.create(
            seller=self.seller.seller_profile,
            title='Test Product',
            description='desc',
            unit_price='10.00',
            quantity=5,
            status='active',
            thumbnail_url='http://example.com/thumb.jpg'
        )
        
        # Add to cart
        CartItem.objects.create(cart=self.buyer.cart, product=product, quantity=2)

        # Checkout
        self.client.force_authenticate(user=self.buyer)
        url = reverse('checkout')
        data = {
            'shipping_address': '123 Test St',
            'payment_method': 'cod'
        }
        response = self.client.post(url, data)
        
        assert response.status_code == status.HTTP_201_CREATED
        # Check inventory is reduced
        product.refresh_from_db()
        assert product.quantity == 3
        # Check cart is empty
        assert CartItem.objects.filter(cart=self.buyer.cart).count() == 0

    def test_checkout_out_of_stock(self):
        # Setup product with limited stock
        product = Product.objects.create(
            seller=self.seller.seller_profile,
            title='Limited Product',
            description='desc',
            unit_price='10.00',
            quantity=1,
            status='active',
            thumbnail_url='http://example.com/thumb.jpg'
        )
        # Add more to cart than available
        CartItem.objects.create(cart=self.buyer.cart, product=product, quantity=2)

        self.client.force_authenticate(user=self.buyer)
        url = reverse('checkout')
        data = {
            'shipping_address': '123 Test St',
            'payment_method': 'cod'
        }
        response = self.client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'Not enough stock' in str(response.data)

    def test_checkout_missing_address(self):
        # Setup product
        product = Product.objects.create(
            seller=self.seller.seller_profile,
            title='Test Product',
            description='desc',
            unit_price='10.00',
            quantity=5,
            status='active'
        )
        CartItem.objects.create(cart=self.buyer.cart, product=product, quantity=1)

        self.client.force_authenticate(user=self.buyer)
        url = reverse('checkout')
        response = self.client.post(url, {'payment_method': 'cod'})
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'Shipping address is required' in str(response.data)
