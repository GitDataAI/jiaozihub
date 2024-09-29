import React, { FC, useEffect, useState } from "react";
import Alert from "react-bootstrap/Alert";
import { humanSize } from "../../../../lib/components/repository/tree";
import { useAPI } from "../../../../lib/hooks/api";
import { cache, qs } from "../../../../lib/api";
import { AlertError, Loading } from "../../../../lib/components/controls";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import rehypeRaw from "rehype-raw";
import SyntaxHighlighter from "react-syntax-highlighter";
import { githubGist as syntaxHighlightStyle } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { IpynbRenderer as NbRenderer } from "react-ipynb-renderer";
import { guessLanguage } from "./index";
import { CustomMarkdownRenderer } from "./CustomMarkdownRenderer";
import {
  RendererComponent,
  RendererComponentWithText,
} from "./types";
import imageUriReplacer from "../../../../lib/remark-plugins/imageUriReplacer";
import { object } from "../../../../lib/api/interface/index";


export const ObjectTooLarge: FC<RendererComponent> = ({ path, sizeBytes }) => {
  return (
    <Alert variant="warning" className="m-5">
      <div>
        Could not render: <code>{path}</code>:
      </div>
      <div>{`size ${sizeBytes}b (${humanSize(sizeBytes)}) is too big`}</div>
    </Alert>
  );
};

export const UnsupportedFileType: FC<RendererComponent> = ({
  path,
  fileExtension,
  contentType,
}) => {
  return (
    <Alert variant="warning" className="m-5">
      <div>
        Could not render: <code>{path}</code>: <br />
      </div>
      <div>{`lakeFS doesn't know how to render this file (extension = "${fileExtension}", content-type = "${contentType}")`}</div>
    </Alert>
  );
};

export const TextDownloader= ({
  repoId,
  branch,
  path,
  type,
  presign,
  onReady,
}) => {
const user = cache.get('user') 
const [body,setBody] = useState()

const { response, error, loading } = useAPI(
      () =>  object.getObject(user, repoId,{refName:branch,path,type:type}),
    [repoId, branch, path]
  );
  
  useEffect(() => {
    if (response) {
      const reader = new FileReader();
      response.blob().then(blob => {
        reader.onloadend = () => {
          setBody(reader.result);
        };
        reader.readAsText(blob);
      });
    }
  }, [response]);
  
    
  if (loading) {
    return <Loading />;
  }
  if (error) {
    return <AlertError error={error} />;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const component =onReady(body? body :'loading');
  return <>{component}</>;
};

export const MarkdownRenderer: FC<RendererComponentWithText> = ({
  text,
  repoId,
  refId,
  path,
}) => {
  return (
    <ReactMarkdown
      className="object-viewer-markdown"
      components={CustomMarkdownRenderer}
      remarkPlugins={[
        [
          imageUriReplacer,
          {
            repo: repoId,
            ref: refId,
            path,
          },
        ],
        remarkGfm,
        remarkHtml,
      ]}
      rehypePlugins={[rehypeRaw]}
    >
      {text}
    </ReactMarkdown>
  );
};

export const TextRenderer: FC<RendererComponentWithText> = ({
  contentType,
  fileExtension,
  text,
}) => {
  const language = guessLanguage(fileExtension, contentType) ?? "plaintext";
  return (
    <SyntaxHighlighter
      style={syntaxHighlightStyle}
      language={language}
      showInlineLineNumbers={true}
      showLineNumbers={true}
    >
      {text}
    </SyntaxHighlighter>
  );
};

export const IpynbRenderer: FC<RendererComponentWithText> = ({ text }) => {
  return (
    <NbRenderer
      ipynb={JSON.parse(text)}
      syntaxTheme="ghcolors"
      language="python"
      bgTransparent={true}
    />
  );
};

export const ImageRenderer: FC<RendererComponent> = ({
  repoId,
  branch,
  path,
  type,
  presign,
}) => {
  const [imgSrc, setImgSrc] = useState(null);
  const refName = branch;
  const user = cache.get('user');

  useEffect(() => {
    const fetchImage = async () => {
      const response = await object.getObject(user,repoId,{refName,path,type})
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setImgSrc(url);
    };

    fetchImage();
  }, [repoId, branch, path, type]);

  return (
    <p className="image-container">
      {imgSrc && <img src={imgSrc} alt={path} />}
    </p>
  );
};

export const PDFRenderer: FC<RendererComponent> = ({
  repoId,
  branch,
  path,
  type
}) => {
  const user = cache.get('user')
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      const response = await object.getObject(user,repoId,{refName:branch,path,type})
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setImgSrc(url);
    };

    fetchImage();
  }, [repoId, branch, path, type]);

  return (
    <div className="m-3 object-viewer-pdf">
      <object
        data={imgSrc}
        type="application/pdf"
      ></object>
    </div>
  );
};
