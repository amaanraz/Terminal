import waspLogo from './waspLogo.png'
import './Main.css'
import { Button, buttonVariants } from "../src/components/ui/button";
import axios from 'axios';



export const MotorPage = () => {

    const sendCommand = (command) => {
        axios.post("http://192.168.1.95:5000/send-command", { command: "start_motor from Web server" })
            .then(response => console.log(response.data))
            .catch(error => console.error("Error:", error));
    };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
        <Button size="main" className="rounded-full text-base" onClick={() => window.location.href = "/"}>
            Back 
        </Button>

        <Button size="main" className="rounded-full text-base" onClick={() => sendCommand("start_motor")}>
            Send Request 
        </Button>
    </div>
  )
}
