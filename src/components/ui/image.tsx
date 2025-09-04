import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import localforage from "localforage";

function toDataURL(src: string, callback: (dataURL: string) => void) {
  var image = new window.Image();
  image.crossOrigin = 'Anonymous';
  image.onload = function () {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = image.height;
    canvas.width = image.width;
    context?.drawImage(image, 0, 0);
    const dataURL = canvas.toDataURL('image/jpeg');
    callback(dataURL);
  };
  image.src = src;
}

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  previewClassName?: string;
}

export const Image: React.FC<ImageProps> = ({
  className,
  previewClassName,
  ...props
}) => {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [imgSrc, setImgSrc] = React.useState('');

  const handleClick = (e: React.MouseEvent) => {
    if (!props.src) {
      return;
    }
    e.stopPropagation();
    setOpen(true);
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setLoading(false);
    if (!props.src?.startsWith("data:image") && imgSrc === '') {
      toDataURL(props.src as string, (dataURL) => {
        localforage.setItem(props.src as string, dataURL);
        setImgSrc(dataURL);
      });
    }
    if (props.onLoad) {
      props.onLoad(e);
    }
  };

  React.useEffect(() => {
    if (props.src?.startsWith("data:image")) {
      return;
    }
    localforage.getItem(props.src as string).then((data) => {
      if (data) {
        setImgSrc(data as string);
      } else {
        setImgSrc(props.src as string);
      }
    });
  }, [props.src]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setLoading(false);
    if (props.onError) {
      props.onError(e);
    }
  };

  return (
    <>
      {props.src && (
        <div className="relative">
          <img
            className={className}
            style={{ cursor: "pointer" }}
            onClick={handleClick}
            onLoad={handleLoad}
            onError={handleError}
            {...props}
            src={imgSrc}
          />
          {loading && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex justify-center items-center">
              <Loader2 className="animate-spin text-white size-8" />
            </div>
          )}
        </div>
      )}
      {!props.src && <div className={cn(className, "flex items-center justify-center text-sm text-gray-500")}>暂无图片</div>}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPortal>
          <DialogOverlay className="bg-black/70 fixed inset-0 z-50" />
          <DialogContent
            className="flex items-center justify-center bg-transparent shadow-none border-none p-0 !outline-none"
            onClick={() => setOpen(false)}
            showCloseButton={false}
          >
            <div className="relative">
              <img
                src={imgSrc}
                alt={props.alt}
                className={
                  previewClassName ||
                  "max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg !outline-none"
                }
                onClick={(e) => e.stopPropagation()}
              />
              {loading && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex justify-center items-center">
                  <Loader2 className="animate-spin text-white size-8" />
                </div>
              )}
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  );
};

export default { Image };
