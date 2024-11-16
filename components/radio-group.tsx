"use client";

import React from "react";

export default function RadioGroup({
	children,
	value,
	onChange,
}: {
	children: React.ReactNode;
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<div className="flex flex-col gap-2">
			{children}
			<div className="flex gap-2">
				{React.Children.map(children, (child) => {
					if (!React.isValidElement(child)) return null;
					return (
						<label
							key={child.props.value}
							htmlFor={child.props.value}
							className="flex items-center gap-2">
							<input
								type="radio"
								name="post-type"
								value={child.props.value}
								checked={value === child.props.value}
								onChange={(e) => onChange(e.target.value)}
							/>
							<span>{child.props.children}</span>
						</label>
					);
				})}
			</div>
		</div>
	);
}
