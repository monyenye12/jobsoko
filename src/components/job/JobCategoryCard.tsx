import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

export interface JobCategoryCardProps {
  name: string;
  icon: string;
  count: number;
  onClick?: () => void;
}

export default function JobCategoryCard({
  name = "Construction",
  icon = "🏗️",
  count = 45,
  onClick,
}: JobCategoryCardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      toast({
        title: `Browsing ${name} Jobs`,
        description: `Showing ${count} available jobs in the ${name} category.`,
      });
      navigate("/dashboard/map-jobs");
    }
  };

  return (
    <Card
      className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50"
      onClick={handleClick}
    >
      <CardContent className="p-0">
        <div className="text-3xl mb-2">{icon}</div>
        <h3 className="text-lg font-medium mb-1">{name}</h3>
        <p className="text-sm text-gray-500">{count} jobs available</p>
      </CardContent>
    </Card>
  );
}
