import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  const fetchWishlist = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('https://coupon-backend-32op.onrender.com/api/wishlist/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setWishlist(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch wishlist", err);
      setWishlist([]);
    }
  };

  const toggleWishlist = async (coupon) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.warn("Please login first.");
      return;
    }

    const exists = wishlist.find((w) => w?.coupon?._id === coupon._id);

    try {
      if (exists) {
        await fetch(`https://coupon-backend-32op.onrender.com/api/wishlist/remove/${coupon._id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        setWishlist((prev) => prev.filter((w) => w?.coupon?._id !== coupon._id));
        toast.success('Removed from wishlist');
      } else {
        const res = await fetch('https://coupon-backend-32op.onrender.com/api/wishlist/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ couponId: coupon._id })
        });

        if (res.ok) {
          const newItem = await res.json();
          setWishlist((prev) => [...prev, newItem]);
          toast.success('Added to wishlist');
        }
      }
    } catch (err) {
      console.error("Error updating wishlist", err);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
