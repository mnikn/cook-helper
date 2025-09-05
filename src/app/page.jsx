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
import { Loader, ChefHat, Calendar, Clock, Edit } from "lucide-react";
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
import localforage from "localforage";
// import { v4 as uuidv4 } from 'uuid';

const OrderItem = ({ id }) => {
  const { cookTable } = useContext(AppContext);
  const getCookData = (id) => cookTable.find((item) => item.id === id);
  const cookData = getCookData(id);
  return (
    <div className="flex flex-col gap-2 shrink-0 items-center">
      <div className="relative overflow-hidden rounded-lg shadow-sm">
        <Image
          src={cookData?.previewPic}
          className="size-16 object-cover bg-blue-50"
        />
      </div>
      <div className="text-gray-600 font-medium text-sm text-center">
        {cookData?.name}
      </div>
    </div>
  );
};

const OrderList = ({
  orderList,
  onEditClick,
  onCloneClick,
  onPreviewClick,
  onDeleteClick,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {orderList.map((item, index) => (
        <div
          key={index}
          className="flex flex-col slide-up"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          {!dayjs(item.time).isSame(dayjs(), "day") && (
            <div className="text-gray-500 font-medium px-4 max-md:px-0 mb-2 flex items-center gap-2">
              <Calendar className="size-4 text-blue-400" />
              {dayjs(item.time).format("MM-DD")}
            </div>
          )}
          <div className="flex max-md:flex-col">
            <div className="flex flex-1 flex-wrap gap-3 rounded-lg hover:cursor-pointer hover:bg-blue-50/50 items-center px-4 py-3 max-md:px-0 transition-colors duration-200">
              <div className="flex gap-4 overflow-x-auto pb-2">
                {item?.items?.map((item) => (
                  <OrderItem id={item} key={item} />
                ))}
              </div>
            </div>
            <div className="md:ml-auto flex gap-2 h-fit my-auto">
              <Button
                variant="outline"
                onClick={() => onPreviewClick(item)}
                className="button-hover border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                看点做
              </Button>
              {!dayjs(item.time).isBefore(dayjs(), "day") && (
                <Button
                  variant="outline"
                  onClick={() => onEditClick(item)}
                  className="button-hover border-green-200 text-green-600 hover:bg-green-50"
                >
                  编辑
                </Button>
              )}
              {dayjs(item.time).isBefore(dayjs(), "day") && (
                <Button
                  variant="outline"
                  onClick={() => onCloneClick(item)}
                  className="button-hover border-purple-200 text-purple-600 hover:bg-purple-50"
                >
                  克隆
                </Button>
              )}
              <Button
                variant="destructive"
                onClick={() => onDeleteClick(item)}
                className="button-hover"
              >
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

  useEffect(() => {
    localforage.setDriver([localforage.INDEXEDDB, localforage.WEBSQL]);
  }, []);

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
    return orderList.filter((item) => dayjs(item.time).isSame(dayjs(), "day") || dayjs(item.time).isAfter(dayjs(), "day"));
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
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-6 fade-in">
            {/* 头部操作区域 */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setEditCookTable(true);
                }}
                className="button-hover border-blue-200 text-blue-600 hover:bg-blue-50 flex items-center gap-2"
              >
                <Edit className="size-4" />
                编辑菜谱
              </Button>
              <Button
                variant="default"
                className="button-hover bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
                onClick={() => {
                  setEditOrderItem({});
                }}
              >
                <ChefHat className="size-4" />
                点菜！
              </Button>
            </div>

            {orderListLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <Loader className="animate-spin text-blue-500 size-8" />
                  <p className="text-gray-500">加载中...</p>
                </div>
              </div>
            )}
            {!orderListLoading && (
              <div className="flex flex-col gap-6">
                {/* 今日菜单 */}
                <div className="glass-effect rounded-xl shadow-sm p-6 card-hover">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Clock className="size-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-blue-600">
                      今天恰的东西：
                    </h2>
                  </div>
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

                {/* 历史菜单 */}
                <div className="glass-effect rounded-xl shadow-sm p-6 card-hover">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gray-500 rounded-lg">
                      <Calendar className="size-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-600">
                      之前恰的东西：
                    </h2>
                  </div>
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
        <AlertDialogContent className="glass-effect">
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
                    "shrink-0 button-hover",
                    galleryCurrentItem === item &&
                      "bg-blue-100 border-blue-300 text-blue-700"
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
