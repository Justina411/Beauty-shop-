import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Shop from "./pages/Shop";
import About from "./pages/About";
// Highlight-start: Updated file name import
import ProductDetails from "./pages/ProductDetails";
// Highlight-end
import Cart from "./pages/Cart";
import Book from "./pages/Book";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Login";
import Contact from "./pages/Contact";
import ProtectedRoute from "./components/ProtectedRoute";
import Payment from "./pages/Payment";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/about" element={<About />} />
        
        {/* Highlight-start: Updated element */}
        <Route path="/product/:id" element={<ProductDetails />} />
        {/* Highlight-end */}
        
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/payment" element={<Payment />} />

        {/* Protected Routes */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/book" element={<Book />} />
        <Route path="/wishlist" element={<Wishlist />} />
      </Routes>
    </>
  );
}

export default App;