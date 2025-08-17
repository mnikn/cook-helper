"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { v4 as uuidv4 } from "uuid";
import AppContext from "@/app/context";
import { useContext, useState, useEffect } from "react";
import { Image } from "@/components/ui/image";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Gallery } from "@/components/ui/gallery";
import { XCircle } from "lucide-react";
import { request } from "@/utils";
import { Input } from "./ui/input";

const EditCookItemDialog = ({ open, onClose, onSubmit, item }) => {
  const [name, setName] = useState(item?.name);
  const [previewPic, setPreviewPic] = useState(item?.previewPic);
  const [cookPics, setCookPics] = useState(item?.cookPics);

  useEffect(() => {
    setName(item?.name);
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
        const reader = new FileReader();
        reader.onload = (event) => {
          onCallback(event.target.result);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleSubmit = () => {
    onSubmit({
      name,
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
          <div className="flex gap-5 items-center">
            <div className="w-18">菜名：</div>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入新的菜名"
            />
          </div>
          <div className="flex gap-0 items-center mt-2">
            <div className="w-18">预览图：</div>
            <Image
              src={previewPic}
              alt=""
              className="w-16 h-16 rounded-md bg-gray-200 object-cover"
            />
            <Button
              className="ml-4"
              variant="outline"
              onClick={() => {
                selectPicFile((result) => {
                  setPreviewPic(result);
                });
              }}
            >
              上传
            </Button>
          </div>
          <div className="flex gap-0 items-center mt-2">
            <div className="w-18 shrink-0">做法：</div>
            <div className={`flex gap-2 overflow-x-auto ${cookPics?.length > 0 ? "mr-4" : ""}`}>
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
                selectPicFile((result) => {
                  setCookPics([...(cookPics || []), result]);
                });
              }}
            >
              上传
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
  const { cookTable } = useContext(AppContext);

  const [finalCookTable, setFinalCookTable] = useState([]);
  const [editCookItem, setEditCookItem] = useState(null);

  useEffect(() => {
    setFinalCookTable(cookTable);
  }, [cookTable]);

  const handleSubmit = () => {
    request(
      "/api/updateCookTable",
      {
        cookTable: finalCookTable,
      },
      {
        method: "POST",
      }
    ).then(() => {
      onSubmit();
      onClose();
    });
  };

  const handleAddItem = () => {
    setEditCookItem({
      name: "新菜" + (finalCookTable.length + 1),
      previewPic: "",
      cookPics: [],
    });
  };

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[800px] h-[90vh] max-md:max-w-[80vw] px-0 flex flex-col"
      >
        <DialogHeader className="px-4">
          <DialogTitle>编辑菜谱</DialogTitle>
          <Button variant="outline" className="mt-2" onClick={handleSubmit}>
            保存！
          </Button>
          <Button variant="outline" onClick={handleAddItem}>
            加新菜！
          </Button>
        </DialogHeader>
        <div className="grid max-md:grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto px-4 flex-1">
          {finalCookTable.map((item) => (
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
                    setFinalCookTable(
                      finalCookTable.filter((item2) => item2.id !== item.id)
                    );
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
        <EditCookItemDialog
          open={!!editCookItem}
          onClose={() => {
            setEditCookItem(null);
          }}
          onSubmit={(item) => {
            console.log(item);
            if (item.id) {
              setFinalCookTable(
                finalCookTable.map((item2) =>
                  item2.id === item.id ? item : item2
                )
              );
            } else {
              setFinalCookTable([...finalCookTable, { ...item, id: uuidv4() }]);
            }
            setEditCookItem(null);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditCookTableDialog;
