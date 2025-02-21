import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface InputFieldProps {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField = ({ label, id, type = "text", placeholder, value, onChange }: InputFieldProps) => {
  return (
    <div className="flex flex-col space-y-1.5">
      <Label htmlFor={id} className="text-left">{label}</Label>
      <Input id={id} type={type} placeholder={placeholder} value={value} onChange={onChange} />
    </div>
  );
};

export default InputField;
