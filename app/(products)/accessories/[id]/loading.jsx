// loading.jsx
// بيستورد التصميم من الكومبوننت المشترك بدل ما يتكرر في كل فئة
import ProductDetailSkeleton from "@/app/components/loading/ProductDetailSkeleton";

export default function Loading() {
  return <ProductDetailSkeleton />;
}