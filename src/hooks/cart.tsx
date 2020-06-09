import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const savedProducts = await AsyncStorage.getItem('products');

      if (savedProducts) setProducts(JSON.parse(savedProducts));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Omit<Product, 'quantity'>) => {
      const obj = products.find(p => p.id === product.id);

      if (obj) {
        setProducts(prevState =>
          prevState.map(p =>
            p.id !== product.id
              ? p
              : {
                  ...p,
                  quantity: p.quantity + 1,
                },
          ),
        );
      } else {
        setProducts(prevState => [...prevState, { ...product, quantity: 1 }]);
      }

      await AsyncStorage.setItem('products', JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(async id => {
    setProducts(prevState =>
      prevState.map(p =>
        p.id !== id
          ? p
          : {
              ...p,
              quantity: p.quantity + 1,
            },
      ),
    );
    await AsyncStorage.setItem('products', JSON.stringify(products));
  }, []);

  const decrement = useCallback(async id => {
    setProducts(prevState =>
      prevState.map(p =>
        p.id !== id
          ? p
          : {
              ...p,
              quantity: p.quantity - 1,
            },
      ),
    );
    await AsyncStorage.setItem('products', JSON.stringify(products));
  }, []);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
