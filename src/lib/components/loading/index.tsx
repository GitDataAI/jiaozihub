import React, { useEffect, useState } from "react";
import "../../../styles/loading.css";
import { version } from "../../api/interface";
const Loadingpage = () => {
  const [loading, setLoading] = useState(0);
  const [ver, setVer] = useState({});
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  const getversion = async () => {
    const response = await version.getVersion();
    setVer(response.data);
    return response;
  };
  useEffect(() => {
    if (localStorage.getItem("hasVisited")) {
      setIsFirstVisit(false);
    }
  }, []);

  useEffect(() => {
    getversion();
  }, []);
  useEffect(() => {
    if (loading == 100) {
      localStorage.setItem("hasVisited", "true");
    } else if (loading < 100) {
      let randomNum = Math.floor(Math.random() * 5) + 1;
      setTimeout(() => {
        setLoading(loading + randomNum > 100 ? 100 : loading + randomNum);
      }, 500);
    }
  }, [loading]);
  if (!isFirstVisit) {
    return <div>loading...</div>;
  }

  const spanList = Array.from({ length: 8 }, (_, index) => index + 1);

  // Generate a second list of spans
  const rotateList = Array.from({ length: 5 }, (_, index) => index);
  return (
    <>
      <div className="loading">
        <div className="Progress">
          <div className="box">
            <svg>
              <filter id="fluid">
                <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
                <feColorMatrix
                  values="
                        1 0 0 0 0
                        0 1 0 0 0
                        0 0 1 0 0
                        0 0 0 20 -10
                "
                ></feColorMatrix>
              </filter>
            </svg>
            <div className="loader">
              {spanList.map((i) => (
                <span key={i} style={{ "--i": i }}></span>
              ))}
              {rotateList.map((j) => (
                <span key={j} className="rotate" style={{ "--j": j }}></span>
              ))}
            </div>
          </div>
          <div className="content">
            <img src="/jiaozifs.png" />
          </div>
        </div>
      </div>
    </>
  );
};
export default Loadingpage;
