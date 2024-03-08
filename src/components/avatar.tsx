import { forwardRef, memo } from "react";

type AvatarProps = {
  className?: string;
  size?: number;
};

export const Avatar = memo(
  forwardRef<any, AvatarProps>(({ className, size = 30 }, ref) => {
    return (
      <div
        className={`flex items-center justify-center bg-[#727272] rounded-full ${className}`}
        style={{ width: size, height: size }}
        ref={ref}
      ></div>
    );
  })
);

Avatar.displayName = "Avatar";
