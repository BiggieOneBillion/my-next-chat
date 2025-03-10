interface OnlineIndicatorProps {
  isOnline: boolean;
}

export function OnlineIndicator({ isOnline }: OnlineIndicatorProps) {
   
  return (
    <div
      className={`h-2.5 w-2.5 rounded-full ${
        isOnline ? 'bg-green-500' : 'bg-gray-300'
      }`}
    />
  );
}