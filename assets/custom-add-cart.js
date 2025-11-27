document.addEventListener('alpine:init', () => {
  Alpine.data('customAddToCartForm', (productId, initialVariantId, isAvailable) => ({
    productId,
    selectedVariantId: initialVariantId,
    variantAvailable: isAvailable,
    loading: false,
    errorMessage: '',
    soldOutMessage: '',

    async submitCart(formElement) {
      if (!formElement || this.loading || !this.variantAvailable) return;

      this.loading = true;
      this.errorMessage = '';
      this.soldOutMessage = '';

      const formData = new FormData(formElement);
      formData.append('sections_url', window.location.pathname);

      const headers = {
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json',
      };
      const cartDrawer = document.querySelector('cart-drawer') || document.querySelector('cart-notification');
      const sections = cartDrawer?.getSectionsToRender?.().map((s) => s.id) || [];
      if (sections.length) {
        formData.append('sections', sections);
      }
      try {
        const response = await fetch(window.routes.cart_add_url, {
          method: 'POST',
          headers: headers,
          body: formData,
        });

        const result = await response.json();

        if (result.status) {
          this.soldOutMessage = result.description || 'Product unavailable';
          this.variantAvailable = false;
        } else {
          if (cartDrawer?.renderContents) {
            cartDrawer.renderContents(result);
          } else {
            window.location = window.routes.cart_url;
          }
        }
      } catch (err) {
        this.errorMessage = 'Failed to add to cart. Please try again.';
        console.error('Fetch Error:', err);
        // window.location = window.routes.cart_url;
      } finally {
        this.loading = false;
      }
    },
  }));
});
