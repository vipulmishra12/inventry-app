import { configureStore } from "@reduxjs/toolkit";
import authreducer from "../redux/feactures/auth/authSlice.js"
import productReducer from "./feactures/product/ProductSlice.jsx";
import filterReducer from "./feactures/product/FilterSlice.jsx";

const store = configureStore({
    reducer: {
        auth: authreducer,
        product: productReducer,
        filter: filterReducer, 
    }
})

export default store;