import { useState, useEffect, createContext } from 'react';
import  productsData from '../data/products.json';


const ProductContext = createContext();
export function ProductProvider({children}){
const [products, setProducts] = useState(()=>{
    const savedProducts = localStorage.getItem("adminProducts");
    return savedProducts
    ? JSON.parse(savedProducts): productsData
})
// useEffect(()=>{
//     localStorage.setItem("adminProducts", JSON.stringify(products));

// }, [products])

useEffect(()=>{
    const fetchProducts = async() => {
        try{
        const response = await fetch('http://127.0.0.1:8001/api/products/')
        if(!response.ok){
            throw new Error("Failed to fetch Products")
        }
        const data = await response.json();
        console.log("Django Products:", data);

       const formattedProducts = data.map((product) => ({
    ...product,
    price: product.price_paise / 100,
    image: "",
    category: "All Products",
    description: "",
    stock: 1,
}));

setProducts(formattedProducts);

    } catch(error){
        console.log("Product API error:", error)
    }
}
    fetchProducts();


},[])
    return (
        <ProductContext.Provider value = {{products ,  setProducts}}>
            {children}
        </ProductContext.Provider>

    )

}
export default ProductContext;
