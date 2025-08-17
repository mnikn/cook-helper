"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import AppContext from "@/app/context";
import { useContext, useState, useEffect } from "react";
import { Image } from "@/components/ui/image";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Gallery } from "@/components/ui/gallery";
import { XIcon } from "lucide-react";
import { request } from "@/utils";

const EditOrderItemDialog = ({
  open,
  onOpenChange,
  onSubmit,
  order = undefined,
}) => {
  const { cookTable } = useContext(AppContext);

  const [orderList, setOrderList] = useState([]);

  const [galleryItem, setGalleryItem] = useState("");

  useEffect(() => {
    setOrderList(order?.items || []);
  }, [order]);

  const handleSubmit = () => {
    if (orderList.length === 0) {
      return;
    }
    request(
      order?.id ? "/api/updateOrder" : "/api/addOrder",
      {
        order: {
          id: order?.id,
          items: orderList,
        },
      },
      {
        method: "POST",
      }
    ).then(() => {
      onSubmit?.();
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={true}
        className="max-w-[800px] h-[90vh] max-md:max-w-[80vw] px-0 flex flex-col"
      >
        <DialogHeader className="px-4">
          <DialogTitle>你要恰么野？</DialogTitle>
          <Button variant="outline" className="mt-2" onClick={handleSubmit}>
            动！
          </Button>
          <div className="flex gap-2 text-gray-800 min-h-[24px] items-center justify-between text-left">
            {orderList.map((item) => cookTable.find((item2) => item2.id === item)?.name).join(",")}
            {orderList.length > 0 && (
              <Button
                variant="ghost"
                className="!p-0 h-fit"
                onClick={() => {
                  setOrderList([]);
                }}
              >
                <XIcon />
              </Button>
            )}
          </div>
        </DialogHeader>
        <div className="grid max-md:grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto px-4 flex-1">
          {cookTable.map((item) => (
            <div key={item.id} className="flex flex-col gap-2 items-center">
              <Image
                src={item.previewPic || ""}
                className="w-full h-32 rounded-md bg-gray-200 object-cover"
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setGalleryItem(item.id);
                }}
              >
                点做
              </Button>
              <div
                className="flex gap-2 items-center"
                onClick={() => {
                  if (orderList.includes(item.id)) {
                    setOrderList(orderList.filter((id) => id !== item.id));
                  } else {
                    setOrderList([...orderList, item.id]);
                  }
                }}
              >
                <Checkbox checked={orderList.includes(item.id)} />
                <div className="text-gray-800">{item.name}</div>
              </div>
            </div>
          ))}
        </div>
        <Gallery
          items={cookTable
            .find((item) => item.id === galleryItem)
            ?.cookPics?.map((item) => ({
              src: item,
            }))}
          open={galleryItem}
          onClose={() => {
            setGalleryItem("");
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditOrderItemDialog;
