import { Badge } from "../../components/ui/badge";
import { Button, buttonVariants } from "../../components/ui/button";
import { Activity, ArrowUpRight, Package  } from "lucide-react";
import React from "react";
// import { Link } from "react-router-dom";


const Hero01 = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-2xl">
        <Badge className="bg-primary/80 rounded-full py-1 border-none">
          TBD INC.
        </Badge>
        <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl md:leading-[1.2] font-bold">
          The AS/RS Terminal
        </h1>
        <p className="mt-6 text-[17px] md:text-lg">
          Request and store items in the AS/RS system
        </p>
        <div className="mt-12 flex items-center justify-center gap-4">
          <Button size="main" className="rounded-full text-base" onClick={() => window.location.href = "/request"}>
              Request Item <ArrowUpRight className="!h-5 !w-5" />
          </Button>
          <Button
            size="main"
            className="rounded-full text-base"
            onClick={() => window.location.href = "/store"}
          >
            Store Item
            <Package className="!h-5 !w-5" /> 
          </Button>

          <Button size="main" className="rounded-full text-base" onClick={() => window.location.href = "/motors"}>
              Test motors <Activity className="!h-5 !w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero01;
