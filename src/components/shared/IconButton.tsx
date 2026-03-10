import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface IconButtonProps extends ButtonProps {
    /** The text to show in the tooltip */
    tooltip: React.ReactNode;
    /** Whether to show the tooltip on the left, right, top, or bottom */
    side?: "top" | "right" | "bottom" | "left";
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ tooltip, side = "top", className, variant = "ghost", size = "icon", children, ...props }, ref) => {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            ref={ref}
                            variant={variant}
                            size={size}
                            className={className}
                            {...props}
                        >
                            {children}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side={side}>
                        {tooltip}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }
);
IconButton.displayName = "IconButton";
