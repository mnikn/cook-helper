import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

const PreviewOrderDialog = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={true}
        className="max-w-[800px] min-h-[300px] max-md:max-w-[80vw]"
      >
        <DialogHeader>
          <DialogTitle>看看你点了么野</DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-gray-800">123</DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewOrderDialog;
