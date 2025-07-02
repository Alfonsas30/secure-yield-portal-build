-- Create board_applications table
CREATE TABLE public.board_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  experience TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.board_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for board applications
CREATE POLICY "Anyone can submit board applications" 
ON public.board_applications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view board applications" 
ON public.board_applications 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update board applications" 
ON public.board_applications 
FOR UPDATE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_board_applications_updated_at
BEFORE UPDATE ON public.board_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();