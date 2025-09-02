"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import AppContext from "@/app/context";
import { useContext, useState, useEffect, useMemo } from "react";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { request } from "@/utils";
import { Input } from "./ui/input";
import { Loader } from "lucide-react";
import { COOK_TYPE_MAP } from "@/app/constants";

const EditCookItemDialog = ({ open, onClose, onSubmit, item }) => {
  const [name, setName] = useState(item?.name);
  const [type, setType] = useState(item?.type || "other");
  const [previewPic, setPreviewPic] = useState(item?.previewPic);
  const [cookPics, setCookPics] = useState(item?.cookPics);

  const [previewPicLoading, setPreviewPicLoading] = useState(false);
  const [cookPicsLoading, setCookPicsLoading] = useState(false);

  useEffect(() => {
    setName(item?.name);
    setType(item?.type || "other");
    setPreviewPic(item?.previewPic);
    setCookPics(item?.cookPics || []);
  }, [item]);

  const selectPicFile = (onCallback) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // const reader = new FileReader();
        // reader.onload = (event) => {
        //   onCallback(event.target.result);
        // };
        // reader.readAsDataURL(file);
        console.log(file);
        // 使用FormData上传文件
        const formData = new FormData();
        formData.append("file", file);

        fetch("/api/uploadPic", {
          method: "POST",
          body: formData,
        })
          .then((res) => res.json())
          .then((res) => {
            console.log(res);
            onCallback(res.data.path);
          });
      }
    };
    input.click();
  };

  const handleSubmit = () => {
    onSubmit({
      ...item,
      name,
      type,
      previewPic,
      cookPics,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          onClose();
        }
      }}
    >
      <DialogContent showCloseButton={true}>
        <DialogHeader>
          <DialogTitle>编辑菜谱</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <div className="flex gap-4 items-center">
            <div className="w-18 shrink-0">菜名：</div>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入新的菜名"
            />
          </div>
          <div className="flex gap-4 items-center mt-2">
            <div className="w-18 shrink-0">类型：</div>
            <Select onValueChange={(value) => setType(value)} value={type}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="类型" />
              </SelectTrigger>
              <SelectContent value={type}>
                {Object.keys(COOK_TYPE_MAP).map((key) => (
                  <SelectItem key={key} value={key}>
                    {COOK_TYPE_MAP[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-0 items-center mt-2">
            <div className="w-18 shrink-0">预览图：</div>
            <Image
              src={previewPic}
              alt=""
              className="w-16 h-16 rounded-md bg-gray-200 object-cover"
            />
            <Button
              className="ml-4"
              variant="outline"
              onClick={() => {
                setPreviewPicLoading(true);
                selectPicFile((result) => {
                  setPreviewPicLoading(false);
                  setPreviewPic(result);
                });
              }}
              disabled={previewPicLoading}
            >
              上传
              {previewPicLoading && <Loader className="w-4 h-4 animate-spin" />}
            </Button>
          </div>
          <div className="flex gap-0 items-center mt-2">
            <div className="w-18 shrink-0">做法：</div>
            <div
              className={`flex gap-2 overflow-x-auto ${
                cookPics?.length > 0 ? "mr-4" : ""
              }`}
            >
              {cookPics?.map((item) => (
                <div className="relative shrink-0">
                  <Image
                    src={item}
                    alt=""
                    className="w-16 h-16 rounded-md bg-gray-200 object-cover my-2"
                  />
                  <Button
                    variant="ghost"
                    className="absolute top-[-0.6rem] right-[-1.2rem]"
                    onClick={() => {
                      setCookPics(cookPics?.filter((item2) => item2 !== item));
                    }}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setCookPicsLoading(true);
                selectPicFile((result) => {
                  setCookPics([...(cookPics || []), result]);
                  setCookPicsLoading(false);
                });
              }}
              disabled={cookPicsLoading}
            >
              上传
              {cookPicsLoading && <Loader className="w-4 h-4 animate-spin" />}
            </Button>
          </div>
          <Button variant="outline" onClick={handleSubmit} className="mt-2">
            保存！
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const EditCookTableDialog = ({ open, onClose, onSubmit }) => {
  const { cookTable, showAlertDialog, loadingCookTable } =
    useContext(AppContext);

  const [editCookItem, setEditCookItem] = useState(null);
  const [showType, setShowType] = useState("all");

  // const handleSubmit = () => {
  //   request(
  //     "/api/updateCookTable",
  //     {
  //       cookTable: finalCookTable,
  //     },
  //     {
  //       method: "POST",
  //     }
  //   ).then(() => {
  //     onSubmit();
  //     onClose();
  //   });
  // };

  const handleAddItem = () => {
    setEditCookItem({
      name: "新菜" + (cookTable.length + 1),
      previewPic: "",
      cookPics: [],
    });
  };

  const showCookTable = useMemo(() => {
    if (showType === "all") {
      return cookTable;
    }
    return cookTable.filter((item) => item.type === showType);
  }, [cookTable, showType]);

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          onClose();
        }
      }}
    >
      <DialogContent
        showCloseButton={true}
        className="max-w-[800px] h-[90vh] max-md:max-w-[80vw] px-0 flex flex-col"
      >
        <DialogHeader className="px-4">
          <DialogTitle>编辑菜谱</DialogTitle>
          <Button
            className="btn-hover bg-blue-500 hover:bg-blue-600 text-white mt-2"
            onClick={handleAddItem}
          >
            加新菜！
          </Button>
        </DialogHeader>

        <RadioGroup
          className="flex flex-wrap gap-2 px-4 text-sm"
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

        <div className="relative flex-1 overflow-y-auto">
          {loadingCookTable && (
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex justify-center items-center">
              <Loader className="w-4 h-4 animate-spin" />
            </div>
          )}
          <div
            className={`grid max-md:grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto px-4 flex-1 ${
              loadingCookTable ? "opacity-50" : ""
            }`}
          >
            {showCookTable.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 items-center">
                <Image
                  src={item.previewPic || ""}
                  className="w-full h-32 rounded-md bg-gray-200 object-cover"
                />
                <div className="flex flex-col gap-2 items-center w-full">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setEditCookItem(item);
                    }}
                  >
                    编辑
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => {
                      showAlertDialog({
                        title: "删除菜谱",
                        description: "确定要删除该菜谱吗？",
                        onConfirm: () => {
                          request(
                            "/api/deleteCookTable",
                            {
                              id: item.id,
                            },
                            {
                              method: "POST",
                            }
                          ).then(() => {
                            onSubmit();
                            setEditCookItem(null);
                          });
                        },
                      });
                    }}
                  >
                    删除
                  </Button>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="text-gray-800">{item?.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <EditCookItemDialog
          item={editCookItem}
          open={!!editCookItem}
          onClose={() => {
            setEditCookItem(null);
          }}
          onSubmit={(item) => {
            console.log(item);
            if (item.id) {
              request(
                "/api/updateCookTable",
                {
                  item,
                },
                {
                  method: "POST",
                }
              ).then(() => {
                onSubmit();
              });
            } else {
              request(
                "/api/addCookTable",
                {
                  item,
                },
                {
                  method: "POST",
                }
              ).then(() => {
                onSubmit();
              });
            }
            setEditCookItem(null);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditCookTableDialog;
