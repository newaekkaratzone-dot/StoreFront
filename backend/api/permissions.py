from rest_framework import permissions

class IsSeller(permissions.BasePermission):
    """
    Custom permission to only allow sellers to create/edit products.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'seller')

class IsBuyer(permissions.BasePermission):
    """
    Custom permission to only allow buyers to add items to cart and checkout.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'buyer')
