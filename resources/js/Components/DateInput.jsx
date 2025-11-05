import { forwardRef, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarIcon } from "@heroicons/react/24/outline";

export default forwardRef(function DateInput(
    {
        className = "",
        selected,
        onChange,
        dateFormat = "dd/MM/yyyy",
        placeholderText = "Select date",
        maxDate = new Date(),
        minDate = null,
        showYearDropdown = true,
        showMonthDropdown = true,
        dropdownMode = "select",
        yearDropdownItemNumber = 100,
        scrollableYearDropdown = true,
        isClearable = true,
        ...props
    },
    ref
) {
    const datePickerRef = useRef(null);

    return (
        <div className="relative">
            <DatePicker
                ref={ref || datePickerRef}
                selected={selected}
                onChange={onChange}
                dateFormat={dateFormat}
                placeholderText={placeholderText}
                maxDate={maxDate}
                minDate={minDate}
                showYearDropdown={showYearDropdown}
                showMonthDropdown={showMonthDropdown}
                dropdownMode={dropdownMode}
                yearDropdownItemNumber={yearDropdownItemNumber}
                scrollableYearDropdown={scrollableYearDropdown}
                isClearable={isClearable}
                className={
                    "rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 w-full " +
                    (isClearable && selected ? "pr-16" : "pr-10") +
                    " " +
                    className
                }
                wrapperClassName="w-full"
                autoComplete="off"
                {...props}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
            </div>
        </div>
    );
});
