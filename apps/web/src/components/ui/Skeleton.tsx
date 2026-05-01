interface SkeletonProps {
  className?: string;
  variant?: "rectangle" | "circle" | "text";
}

const Skeleton = ({ className = "", variant = "rectangle" }: SkeletonProps) => {
  const variantClasses = {
    rectangle: "rounded-lg",
    circle: "rounded-full",
    text: "rounded h-4"
  };

  return (
    <div
      className={`animate-pulse bg-gray-200 ${variantClasses[variant]} ${className}`}
      aria-hidden="true"
    />
  );
};

export default Skeleton;
