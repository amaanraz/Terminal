import waspLogo from './waspLogo.png'
import './Main.css'
import Hero01 from './components/hero-01/hero-01';


export const MainPage = () => {
  const handleRequestClick = () => {
    window.location.href = "/request";
  };

  const handleStoreClick = () => {
    window.location.href = "/store";
  };

  return (
    <Hero01 />
  )
}
