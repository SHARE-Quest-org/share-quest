import { Home } from "lucide-react";
import imgLogo from "../../assets/170805.jpg";
import imgSearch from "../../assets/118_20260501193319.png";
import imgUser from "../../assets/119_20260501193952.png";
import imgStar from "../../assets/120_20260501194440.png";
import imgSettings from "../../assets/121_20260501195446.png";

export const LogoIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <img src={imgLogo} className={`${className} object-cover rounded`} alt="Logo" />
);

export const CustomHomeIcon = ({
  className = "w-6 h-6",
  active = false,
}: {
  className?: string;
  active?: boolean;
}) => <Home className={`${className} ${active ? "text-blue-600" : "text-gray-400"}`} />;

export const CustomSearchIcon = ({
  className = "w-6 h-6",
  active,
}: {
  className?: string;
  active?: boolean;
}) => (
  <img
    src={imgSearch}
    className={`${className} object-cover rounded-full ${active ? "ring-2 ring-blue-500" : ""}`}
    alt="Search"
  />
);

export const CustomUserIcon = ({
  className = "w-6 h-6",
  active = false,
}: {
  className?: string;
  active?: boolean;
}) => (
  <img
    src={imgUser}
    className={`${className} object-cover rounded-full ${active ? "ring-2 ring-blue-500" : ""}`}
    alt="User"
  />
);

export const CustomStarIcon = ({
  className = "w-6 h-6",
  active = false,
}: {
  className?: string;
  active?: boolean;
}) => (
  <img
    src={imgStar}
    className={`${className} object-cover rounded-full ${active ? "ring-2 ring-yellow-400" : ""}`}
    alt="Star"
  />
);

export const CustomSettingsIcon = ({
  className = "w-6 h-6",
  active,
}: {
  className?: string;
  active?: boolean;
}) => (
  <img
    src={imgSettings}
    className={`${className} object-cover rounded-full ${active ? "ring-2 ring-gray-400" : ""}`}
    alt="Settings"
  />
);
