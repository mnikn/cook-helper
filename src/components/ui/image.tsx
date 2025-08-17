import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  previewClassName?: string;
}

export const Image: React.FC<ImageProps> = ({
  className,
  previewClassName,
  ...props
}) => {
  const [open, setOpen] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (!props.src) {
      return;
    }
    e.stopPropagation();
    setOpen(true);
  };

  return (
    <>
      <img
        className={className}
        style={{ cursor: "pointer" }}
        onClick={handleClick}
        {...props}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPortal>
          <DialogOverlay className="bg-black/70 fixed inset-0 z-50" />
          <DialogContent
            className="flex items-center justify-center bg-transparent shadow-none border-none p-0 !outline-none"
            onClick={() => setOpen(false)}
            showCloseButton={false}
          >
            <img
              src={props.src}
              alt={props.alt}
              className={
                previewClassName ||
                "max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg !outline-none"
              }
              onClick={(e) => e.stopPropagation()}
            />
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  );
};

export default { Image };
