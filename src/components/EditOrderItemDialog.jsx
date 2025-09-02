"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import AppContext from "@/app/context";
import { useContext, useState, useEffect, useMemo } from "react";
import { Image } from "@/components/ui/image";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Gallery } from "@/components/ui/gallery";
import { XIcon } from "lucide-react";
import { request } from "@/utils";
import dayjs from "dayjs";
import { COOK_TYPE_MAP } from "@/app/constants";

const EditOrderItemDialog = ({
  open,
  onOpenChange,
  onSubmit,
  order = undefined,
}) => {
  const { cookTable } = useContext(AppContext);
  const [showType, setShowType] = useState("all");

  const [orderList, setOrderList] = useState([]);

  const [galleryItem, setGalleryItem] = useState("");

  const showCookTable = useMemo(() => {
    if (showType === "all") {
      return cookTable;
    }
    return cookTable.filter((item) => item.type === showType);
  }, [cookTable, showType]);

  useEffect(() => {
    setOrderList(order?.items || []);
  }, [order]);

  const handleSubmit = () => {
    if (orderList.length === 0) {
      return;
    }
    let targetOrderTime;
    if (order?.time) {
      targetOrderTime = order.time;
    } else {
      const currentTime = dayjs();
      // 如果当前时间超过 19:00，则视为明天的订单
      if (currentTime.isAfter(dayjs().hour(19).minute(0).second(0))) {
        targetOrderTime = dayjs().add(1, "day").format("YYYY-MM-DD");
      } else {
        targetOrderTime = dayjs().format("YYYY-MM-DD");
      }
    }
    request(
      order?.id ? "/api/updateOrder" : "/api/addOrder",
      {
        order: {
          id: order?.id,
          items: orderList,
          time: targetOrderTime,
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
          <Button
            variant="default"
            className="button-hover bg-blue-500 hover:bg-blue-600 text-white mt-2"
            onClick={handleSubmit}
          >
            动！
          </Button>

          <RadioGroup
            className="flex flex-wrap gap-2 text-sm mt-2"
            value={showType}
            onValueChange={(value) => setShowType(value)}
          >
            <div className="flex items-center gap-1">
              <RadioGroupItem value="all" />
              <span>全部</span>
            </div>
            {Object.keys(COOK_TYPE_MAP).map((key) => (
              <div key={key} className="flex items-center gap-1">
                <RadioGroupItem value={key}></RadioGroupItem>
                <span>{COOK_TYPE_MAP[key]}</span>
              </div>
            ))}
          </RadioGroup>

          <div className="flex gap-2 text-gray-800 min-h-[24px] items-center justify-between text-left">
            {orderList
              .map((item) => cookTable.find((item2) => item2.id === item)?.name)
              .join(",")}
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
          {showCookTable.map((item) => (
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
