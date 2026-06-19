from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, ProductViewSet, CartView, CheckoutView, OrderViewSet, SellerProfileView, SellerAnalyticsView, CustomTokenObtainPairView, ImageUploadView

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('users/register/', RegisterView.as_view(), name='register'),
    path('cart/', CartView.as_view(), name='cart'),
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('seller/profile/', SellerProfileView.as_view(), name='seller-profile'),
    path('seller/analytics/', SellerAnalyticsView.as_view(), name='seller-analytics'),
    path('upload/image/', ImageUploadView.as_view(), name='image-upload'),
    path('', include(router.urls)),
]
