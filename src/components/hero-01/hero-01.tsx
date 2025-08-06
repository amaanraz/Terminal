import { Badge } from "../../components/ui/badge";
import { Button, buttonVariants } from "../../components/ui/button";
import { Activity, ArrowUpRight, Package  } from "lucide-react";
import React from "react";

const Hero01 = () => {
  return (
    <div className="hero01-root">
      <div className="hero01-content">
        <Badge className="hero01-badge">
          C11 Robotics.
        </Badge>
        <h1 className="hero01-title">
          BitsBox
        </h1>
        <p className="hero01-subtitle">
          Request and store items in the BitsBox
        </p>
        <div className="hero01-buttons">
          <Button size="main" className="hero01-btn" onClick={() => window.location.href = "/request"}>
              Request Item <ArrowUpRight className="hero01-icon" />
          </Button>
          <Button
            size="main"
            className="hero01-btn"
            onClick={() => window.location.href = "/store"}
          >
            Store Item
            <Package className="hero01-icon" /> 
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero01;
