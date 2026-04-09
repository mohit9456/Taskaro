"use client";
import React, { useEffect, useState } from "react";
import AlarmCard from "@/app/components/smartAlarm/AlarmCard";
import CreateAlarm from "@/app/components/smartAlarm/CreateAlarm";
import { protectedApiGet } from "@/lib/api";
import Loader from "@/components/Loader";

const SmartAlarmPage = () => {
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    protectedApiGet("/secure/alarm/list")
      .then((data) => setAlarms(data?.alarms ?? []))
      .catch((err) => {
        console.log(err, "error");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">⏰ Smart Alarm</h1>

      {/* UPCOMING */}
      <div className="space-y-3">
        <h2 className="font-medium">Upcoming Alarms</h2>
        {loading ? (
          <div className="w-fulll flex justify-center items-center">
            <Loader />
          </div>
        ) : alarms.length === 0 ? (
          <p className="w-full text-center font-semibold text-2xl">No upcoming alarms Found !</p>
        ) : (
          alarms.map((a, i) => <AlarmCard key={i} alarm={a} />)
        )}
      </div>

      {/* CREATE */}
      <CreateAlarm />
    </div>
  );
};

export default SmartAlarmPage;
