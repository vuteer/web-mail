import React from "react";
import { useRouter } from "next/navigation";
// file grid layout @
import { Download, Share2, Trash2 } from "lucide-react";

import { AppImage } from "@/components";
import { Heading3, Paragraph } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { icons } from "@/assets";
import { formatBytes } from "@/utils/size";

import {AttachmentType, FileType} from "@/types"; 
import FileShareModal from "@/components/modals/file-share";
import Confirm from "@/components/modals/confirm";
import { cn } from "@/lib/utils";
import { handleDownload } from "@/components/utils/generate-icon";

interface GridProps extends AttachmentType {};


export const GridPlaceholder = () => {

    return (
        <div className="flex flex-col flex-1 gap-1 items-center">
            <Skeleton className="relative w-full h-[30px] lg:h-[100px]"/>
            <Skeleton className="w-[70%] h-[14px] rounded-full self-center"/>
            <Skeleton className="w-[30%] h-[10px] rounded-full self-center"/>
            {/* <SkeletonButtons /> */}
        </div>
    )
}

const Grid: React.FC<GridProps> = ({
    id, type, title, size, visibility
}) => {
    const [loading, setLoading] = React.useState<boolean>(false); 
    let src: string = icons[type as FileType]; 
    const {push} = useRouter(); 


    return (
        <div 
            className={cn("flex flex-col items-center gap-1 cursor-pointer ", type === "folder" ? "hover:text-main-color": "")}
            onClick={() => {
                type === "folder" ? 
                    push(`/files?folder=${id}`):
                    {}
            }}
        >
            <div className="relative w-[30px] h-[40px] lg:w-[30px] lg:h-[30px] overflow-hidden">
                <AppImage 
                    src={src}
                    fill
                    title={title}
                    alt={title}
                    objectFit="contain"
                    nonBlur={true}
                />
            </div>
            <div className="flex flex-col flex-1">
                <Heading3 className={"text-center text-xs lg:text-sm line-clamp-1 capitalize"}>{title}</Heading3>
                {type !== "folder" && <Paragraph className="text-center text-xs lg:text-xs uppercase">{formatBytes(size)}</Paragraph>}
            </div>
            {/* <Buttons /> */}
        </div>
    )
};

export default Grid; 

export const Buttons = ({fileId}: {fileId: string}) => {
    const [openShareModal, setOpenShareModal] = React.useState<boolean>(false);
    const [openDeleteModal, setOpenDeleteModal] = React.useState<boolean>(false);

    const [loading, setLoading] = React.useState<boolean>(false); 

    return (
        <>
            <FileShareModal 
                title="Book 1"
                isOpen={openShareModal}
                onClose={() => setOpenShareModal(false)}
                id="1234"
                shared={""}
            />
            <Confirm
                isOpen={openDeleteModal}
                onClose={() => setOpenDeleteModal(false)}
                title="Delete Book 1"
                description="The file will be deleted permanently. Do you wish to proceed?"
            >
                <div className="flex justify-end">
                    <Button
                        variant="destructive"
                        disabled={loading}
                    >
                        Delete
                    </Button>
                </div>
            </Confirm>
        
            <div className="flex gap-2 items-center">
                <Button 
                    variant="ghost" 
                    size={"sm"}
                    disabled={loading}
                    onClick={() => handleDownload(fileId, setLoading)}
                >
                    <Download size={18}/>
                </Button>
                <Button 
                    variant="ghost" 
                    size={"sm"}
                    onClick={() => setOpenShareModal(true)}
                    disabled={loading}
                >
                    <Share2 size={18}/>
                </Button>
                <Button 
                    variant="ghost" 
                    size={"sm"}
                    onClick={() => setOpenDeleteModal(true)}
                    disabled={loading}
                >
                    <Trash2 size={18}/>
                </Button>
            </div>
        </>
)}; 

export const SkeletonButtons = () => (
    <div className="flex gap-2 justify-center">
        <Skeleton className="w-9 h-9 rounded-lg"/>
        <Skeleton className="w-9 h-9 rounded-lg"/>
        <Skeleton className="w-9 h-9 rounded-lg"/>
        <Skeleton className="w-9 h-9 rounded-lg"/>
    </div>
)