import { configureStore } from "@reduxjs/toolkit";
/**
 * Central Redux store configuration.
 * - Combines feature reducers under descriptive keys
 * - Exports typed hooks for safe usage across the app
 */
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { propertyApi } from "./api/propertyApi";
import { authApi } from "./api/authApi";
import { chatApi } from "./api/chatApi";
import { storeApi } from "./api/storeApi";
import { categoryApi } from "./api/categoryApi";
import { productApi } from "./api/productApi";
import { verificationApi } from "./api/verificationApi";
import { reviewApi } from "./api/reviewApi";
import { aiApi } from "./api/aiApi";
import { analyticsApi } from "./api/analyticsApi";
import { notificationApi } from "./api/notificationApi";
import { marketplaceApi } from "./api/marketplaceApi";
import { blogApi } from "./api/blogApi";
import { subscriptionApi } from "./api/subscriptionApi";
import { paymentApi } from "./api/paymentApi";

const dummyReducer = (state = {}) => {
  return state;
};

export const createStore = () => {
  return configureStore({
    reducer: {
      dummy: dummyReducer,
      [propertyApi.reducerPath]: propertyApi.reducer,
      [authApi.reducerPath]: authApi.reducer,
      [chatApi.reducerPath]: chatApi.reducer,
      [storeApi.reducerPath]: storeApi.reducer,
      [categoryApi.reducerPath]: categoryApi.reducer,
      [productApi.reducerPath]: productApi.reducer,
      [verificationApi.reducerPath]: verificationApi.reducer,
      [reviewApi.reducerPath]: reviewApi.reducer,
      [aiApi.reducerPath]: aiApi.reducer,
      [analyticsApi.reducerPath]: analyticsApi.reducer,
      [notificationApi.reducerPath]: notificationApi.reducer,
      [marketplaceApi.reducerPath]: marketplaceApi.reducer,
      [blogApi.reducerPath]: blogApi.reducer,
      [subscriptionApi.reducerPath]: subscriptionApi.reducer,
      [paymentApi.reducerPath]: paymentApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(propertyApi.middleware, authApi.middleware, chatApi.middleware, storeApi.middleware, categoryApi.middleware, productApi.middleware, verificationApi.middleware, reviewApi.middleware, aiApi.middleware, analyticsApi.middleware, notificationApi.middleware, marketplaceApi.middleware, blogApi.middleware, subscriptionApi.middleware, paymentApi.middleware),
  });
};

export const store = createStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
