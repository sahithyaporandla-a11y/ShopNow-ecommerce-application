import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState({ products: [] });

  const fetchWishlist = useCallback(async () => {
    if (!user) { setWishlist({ products: [] }); return; }
    try {
      const { data } = await api.get('/wishlist');
      setWishlist(data.wishlist);
    } catch {}
  }, [user]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const addToWishlist = async (productId) => {
    if (!user) { toast.error('Please login to add to wishlist'); return; }
    try {
      const { data } = await api.post('/wishlist/add', { productId });
      setWishlist(data.wishlist);
      toast.success('Added to wishlist ❤️');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const { data } = await api.delete(`/wishlist/remove/${productId}`);
      setWishlist(data.wishlist);
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove');
    }
  };

  const isWishlisted = (productId) =>
    wishlist.products?.some(p => (p._id || p) === productId);

  const toggleWishlist = (productId) => {
    if (isWishlisted(productId)) removeFromWishlist(productId);
    else addToWishlist(productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isWishlisted, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
