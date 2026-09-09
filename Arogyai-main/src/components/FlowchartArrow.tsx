
interface FlowchartArrowProps {
  direction: 'down' | 'right' | 'left' | 'diagonal-right' | 'diagonal-left';
  label?: string;
  className?: string;
}

export function FlowchartArrow({ direction, label, className = '' }: FlowchartArrowProps) {
  const getArrowClasses = () => {
    switch (direction) {
      case 'down':
        return 'flex flex-col items-center';
      case 'right':
        return 'flex items-center';
      case 'left':
        return 'flex items-center';
      case 'diagonal-right':
        return 'flex items-center justify-center transform rotate-45';
      case 'diagonal-left':
        return 'flex items-center justify-center transform -rotate-45';
      default:
        return 'flex flex-col items-center';
    }
  };

  const getArrowSvg = () => {
    const strokeColor = "#030213";
    const strokeWidth = 2;
    
    switch (direction) {
      case 'down':
        return (
          <svg width="2" height="40" className="mx-2">
            <line x1="1" y1="0" x2="1" y2="30" stroke={strokeColor} strokeWidth={strokeWidth} />
            <polygon points="1,30 6,25 1,35 -4,25" fill={strokeColor} />
          </svg>
        );
      case 'right':
        return (
          <svg width="40" height="2" className="my-2">
            <line x1="0" y1="1" x2="30" y2="1" stroke={strokeColor} strokeWidth={strokeWidth} />
            <polygon points="30,1 25,6 35,1 25,-4" fill={strokeColor} />
          </svg>
        );
      case 'left':
        return (
          <svg width="40" height="2" className="my-2">
            <line x1="40" y1="1" x2="10" y2="1" stroke={strokeColor} strokeWidth={strokeWidth} />
            <polygon points="10,1 15,6 5,1 15,-4" fill={strokeColor} />
          </svg>
        );
      default:
        return (
          <svg width="2" height="40" className="mx-2">
            <line x1="1" y1="0" x2="1" y2="30" stroke={strokeColor} strokeWidth={strokeWidth} />
            <polygon points="1,30 6,25 1,35 -4,25" fill={strokeColor} />
          </svg>
        );
    }
  };

  return (
    <div className={`${getArrowClasses()} ${className}`}>
      {label && (
        <span className="text-sm text-muted-foreground mb-1">{label}</span>
      )}
      {getArrowSvg()}
    </div>
  );
}