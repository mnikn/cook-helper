"use client";

import dayjs from "dayjs";
import {
  useMemo,
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
} from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import EditOrderItemDialog from "@/components/EditOrderItemDialog";
import PreviewOrderDialog from "@/components/PreviewOrderDialog";
import { Image } from "@/components/ui/image";
import { request } from "@/utils";
import { Loader } from "lucide-react";
import AppContext from "./context";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Gallery } from "@/components/ui/gallery";
import EditCookTableDialog from "@/components/EditCookTableDialog";
// import { v4 as uuidv4 } from 'uuid';

const OrderList = ({
  orderList,
  onEditClick,
  onCloneClick,
  onPreviewClick,
  onDeleteClick,
}) => {
  const { cookTable } = useContext(AppContext);
  const getCookData = (id) => cookTable.find((item) => item.id === id);

  const OrderItem = ({ id }) => {
    const cookData = getCookData(id);
    return (
      <div className="flex flex-col gap-2 shrink-0 items-center">
        <Image
          src={cookData?.previewPic}
          className="size-16 object-cover rounded-md bg-gray-200"
        />
        <div className="text-gray-800 font-medium">{cookData?.name}</div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {orderList.map((item, index) => (
        <div key={index} className="flex flex-col">
          {!dayjs(item.time).isSame(dayjs(), "day") && (
            <div className="text-gray-800 font-medium px-4 max-md:px-0">
              {dayjs(item.time).format("MM-DD")}
            </div>
          )}
          <div className="flex max-md:flex-col">
            <div className="flex flex-1 flex-wrap gap-2 rounded-md hover:cursor-pointer hover:bg-gray-100 items-center px-4 py-2 max-md:px-0">
              <div className="flex gap-4 overflow-x-auto pb-2">
                {item?.items?.map((item) => (
                  <OrderItem id={item} key={item} />
                ))}
              </div>
            </div>
            <div className="md:ml-auto flex gap-2 h-fit my-auto">
              <Button variant="outline" onClick={() => onPreviewClick(item)}>
                看点做
              </Button>
              {!dayjs(item.time).isBefore(dayjs(), "day") && (
                <Button variant="outline" onClick={() => onEditClick(item)}>
                  编辑
                </Button>
              )}
              {dayjs(item.time).isBefore(dayjs(), "day") && (
                <Button variant="outline" onClick={() => onCloneClick(item)}>
                  克隆
                </Button>
              )}
              <Button variant="destructive" onClick={() => onDeleteClick(item)}>
                删除
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

function Home() {
  const [cookTable, setCookTable] = useState([]);
  const [orderList, setOrderList] = useState([]);
  const [loadingCookTable, setLoadingCookTable] = useState(true);
  const [orderListLoading, setOrderListLoading] = useState(true);

  const [editOrderItem, setEditOrderItem] = useState(null);
  const [previewOrderItem, setPreviewOrderItem] = useState(null);

  const [galleryOrderItem, setGalleryOrderItem] = useState(null);
  const [galleryPics, setGalleryPics] = useState([]);
  const [galleryCurrentItem, setGalleryCurrentItem] = useState(null);

  const getOrderList = () => {
    setOrderListLoading(true);
    request("/api/getOrderList")
      .then((res) => {
        setOrderList(res.data.orderList);
      })
      .finally(() => {
        setOrderListLoading(false);
      });
  };
  const getCookTable = () => {
    setLoadingCookTable(true);
    request("/api/getCookTable")
      .then((res) => {
        setCookTable(res.data.cookTable);
      })
      .finally(() => {
        setLoadingCookTable(false);
      });
  };

  useEffect(() => {
    getCookTable();
    getOrderList();
  }, []);

  const todayOrderList = useMemo(() => {
    return orderList.filter((item) => dayjs(item.time).isSame(dayjs(), "day"));
  }, [orderList]);
  const beforeOrderList = useMemo(() => {
    return orderList.filter((item) =>
      dayjs(item.time).isBefore(dayjs(), "day")
    );
  }, [orderList]);

  const handleItemPreviewClick = (item) => {
    setGalleryOrderItem(item);
    setGalleryCurrentItem(item.items[0]);
  };

  const handleItemEditClick = (item) => {
    setEditOrderItem(item);
  };
  const handleItemCloneClick = (item) => {
    showAlertDialog({
      description: "确定要基于这份生成今日菜单？",
      onConfirm: () => {
        request(
          "/api/copyOrder",
          {
            order: item,
          },
          {
            method: "POST",
          }
        ).then(() => {
          getOrderList();
        });
      },
    });
  };
  const handleItemDeleteClick = (item) => {
    showAlertDialog({
      description: "确定要删除吗？",
      onConfirm: () => {
        console.log("cxxc: ", item);
        request(
          "/api/deleteOrder",
          {
            id: item.id,
          },
          {
            method: "POST",
          }
        ).then(() => {
          getOrderList();
        });
      },
    });
  };

  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [alertDialogTitle, setAlertDialogTitle] = useState("");
  const [alertDialogDescription, setAlertDialogDescription] = useState("");
  const [alertDialogCancelText, setAlertDialogCancelText] = useState("取消");
  const [alertDialogConfirmText, setAlertDialogConfirmText] = useState("确定");
  const alertDialogOnConfirmRef = useRef(() => {});
  const showAlertDialog = ({
    title,
    description,
    cancelText = "取消",
    confirmText = "确定",
    onConfirm = () => {},
  }) => {
    setAlertDialogOpen(true);
    setAlertDialogTitle(title);
    setAlertDialogDescription(description);
    setAlertDialogCancelText(cancelText);
    setAlertDialogConfirmText(confirmText);
    alertDialogOnConfirmRef.current = onConfirm;
  };

  useEffect(() => {
    setGalleryPics(
      cookTable
        .find((item) => item.id === galleryCurrentItem)
        ?.cookPics?.map((item) => ({
          src: item,
        })) || []
    );
  }, [galleryCurrentItem, cookTable]);

  const [editCookTable, setEditCookTable] = useState(false);

  return (
    <AppContext.Provider
      value={{ cookTable, showAlertDialog, loadingCookTable }}
    >
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditCookTable(true);
              }}
            >
              编辑菜谱
            </Button>
            <Button
              variant="outline"
              className="text-black"
              onClick={() => {
                setEditOrderItem({});
              }}
            >
              点菜！
            </Button>

            {orderListLoading && (
              <div className="flex justify-center items-center">
                <Loader className="animate-spin" />
              </div>
            )}
            {!orderListLoading && (
              <div className="flex flex-col gap-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    今天恰的东西：
                  </h2>
                  <div className="flex flex-col">
                    <OrderList
                      orderList={todayOrderList}
                      onPreviewClick={handleItemPreviewClick}
                      onEditClick={handleItemEditClick}
                      onCloneClick={handleItemCloneClick}
                      onDeleteClick={handleItemDeleteClick}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    之前恰的东西：
                  </h2>
                  <div className="flex flex-col">
                    <OrderList
                      orderList={beforeOrderList}
                      onPreviewClick={handleItemPreviewClick}
                      onEditClick={handleItemEditClick}
                      onDeleteClick={handleItemDeleteClick}
                      onCloneClick={handleItemCloneClick}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <EditOrderItemDialog
        order={editOrderItem}
        open={editOrderItem}
        onOpenChange={(open) => {
          if (!open) {
            setEditOrderItem(null);
          }
        }}
        onSubmit={getOrderList}
      />

      <AlertDialog
        open={alertDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setAlertDialogOpen(false);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertDialogTitle}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            {alertDialogDescription}
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAlertDialogOpen(false)}>
              {alertDialogCancelText}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                alertDialogOnConfirmRef.current?.();
                setAlertDialogOpen(false);
              }}
            >
              {alertDialogConfirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Gallery
        items={galleryPics}
        open={!!galleryOrderItem}
        onClose={() => {
          setGalleryOrderItem(null);
        }}
        customFooter={
          <div className="flex gap-2 overflow-x-auto w-full py-2">
            {galleryOrderItem?.items?.map((item) => {
              return (
                <Button
                  variant="outline"
                  key={item}
                  className={cn(
                    "shrink-0",
                    galleryCurrentItem === item && "bg-gray-200"
                  )}
                  onClick={() => {
                    setGalleryCurrentItem(item);
                  }}
                >
                  {cookTable.find((item2) => item2.id === item)?.name || item}
                </Button>
              );
            })}
          </div>
        }
      />
      <EditCookTableDialog
        open={editCookTable}
        onSubmit={getCookTable}
        onClose={() => {
          setEditCookTable(false);
        }}
      />
    </AppContext.Provider>
  );
}

export default Home;
