// Provide an interface for index.tsx in repositories
import { CSSProperties, MouseEventHandler, ReactElement } from "react";

export interface CreateRepositoryButtonProps {
    variant?: string;
    enabled?: boolean;
    onClick:  MouseEventHandler<HTMLButtonElement>;
    word?: string;
    style?: Object
} 

export interface GettingStartedCreateRepoButtonProps {
    text: string | ReactElement;
    variant?: string;
    enabled?: boolean;
    onClick:  MouseEventHandler<HTMLButtonElement>;
    creatingRepo:  boolean;
    style?: CSSProperties;
}


export interface CreateRepositoryModalProps {
    show: boolean;
    error: null | undefined;
    onSubmit:(repo:{ name: string, description: string ,visible:boolean,blockstore_config:string}) => Promise<boolean>;
    onCancel:()=>void;
    inProgress: boolean;
    samlpleRepoChecked?: boolean;
    setShow:React.Dispatch<React.SetStateAction<boolean>>;
    setRefresh:React.Dispatch<React.SetStateAction<boolean>>
    refresh: boolean
}

export interface GetStartedProps{
    onCreateEmptyRepo:()=>void;
    creatingRepo:boolean;
    createRepoError:Error | null;
}

export interface RepositoryListProps{
    onPaginate: (page: string | boolean | null) => void;
    prefix: string;
    after:any;
    refresh: boolean;
    // onCreateSampleRepo:() => Promise<void>;
    onCreateEmptyRepo: ()=>void;
    toggleShowActionsBar: (show?: boolean) => void; 
    creatingRepo: boolean; 
    createRepoError: null|Error;
}

export interface SQLEditorProps {
    initialValue: string;
    onChange: (code: string) => void;
    onRun: () => void;
}

export interface RepositoryCreateFormProps{
    id:string, 
    onSubmit:(repo: { name: string, description: string ,visible:boolean,blockstore_config:string}) => Promise<boolean> ,
    setFormValid:React.Dispatch<React.SetStateAction<boolean>>
}