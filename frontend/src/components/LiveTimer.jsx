const LiveTimer = ({ dueDate }) => {
  const [timeString, setTimeString] = useState("");

  useEffect(() => {
    const updateTimer = () => {
      const target = new Date(dueDate);
      const now = new Date();
      const diffMs = target - now;

      if (isNaN(target.getTime()) || diffMs <= 0) {
        setTimeString("0d 0h 0m");
        return;
      }

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      setTimeString(`${days}d ${hours}h ${minutes}m`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [dueDate]);

  return <span className="text-xs font-medium text-black tabular-nums">{timeString}</span>;
};