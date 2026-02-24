"use client";
import WaterHeader from "@/app/components/water/WaterHeader";
import WaterProgress from "@/app/components/water/WaterProgress";
import WaterQuickAdd from "@/app/components/water/WaterQuickAdd";
import WaterInsight from "@/app/components/water/WaterInsight";
import WaterLog from "@/app/components/water/WaterLog";
import WaterStreakWarning from "@/app/components/water/WaterStreakWarning";
import WaterSmartReminder from "@/app/components/water/WaterSmartReminder";

const WaterPage = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <WaterHeader />
      <WaterSmartReminder />
      <WaterProgress />
      <WaterQuickAdd />
      <WaterStreakWarning />
      <WaterInsight />
      <WaterLog />
    </div>
  );
};

export default WaterPage;