
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Žinutė išsiųsta!",
      description: "Mes susisieksime su jumis per 24 valandas.",
    });
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section id="kontaktai" className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 bg-green-50 text-green-700 border-green-200">
            <Mail className="w-4 h-4 mr-2" />
            Susisiekite su mumis
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
            Turime klausimų?
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Mūsų ekspertų komanda visada pasiruošusi padėti. Susisiekite su mumis bet kuriuo jums patogiu būdu.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-slate-50">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-slate-900">
                Parašykite mums
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                      Vardas *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="mt-1 border-2 focus:border-blue-500"
                      placeholder="Jūsų vardas"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
                      Telefonas
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-1 border-2 focus:border-blue-500"
                      placeholder="+370 XXX XXXXX"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                    El. paštas *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 border-2 focus:border-blue-500"
                    placeholder="jusu.paštas@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-sm font-medium text-slate-700">
                    Žinutė *
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="mt-1 border-2 focus:border-blue-500"
                    placeholder="Parašykite savo klausimą arba komentarą..."
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 font-semibold py-3"
                  size="lg"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Siųsti žinutę
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-600 to-green-600 text-white">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold mb-6">Kontaktinė informacija</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-white/20 p-3 rounded-full">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">El. paštas</h4>
                      <p className="opacity-90">info@ltb.lt</p>
                      <p className="opacity-90">support@ltb.lt</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-white/20 p-3 rounded-full">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Telefonas</h4>
                      <p className="opacity-90">+370 5XXX XXXX</p>
                      <p className="text-sm opacity-75">Nemokamas skambutis</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-white/20 p-3 rounded-full">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Adresas</h4>
                      <p className="opacity-90">Konstitucijos pr. XX</p>
                      <p className="opacity-90">Vilnius, Lietuva</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-white/20 p-3 rounded-full">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Darbo laikas</h4>
                      <p className="opacity-90">Pirmadienį - Penktadienį</p>
                      <p className="opacity-90">9:00 - 18:00</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-slate-50">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-4 text-slate-900">Greitas atsakymas</h3>
                <p className="text-slate-600 mb-4">
                  Mes stengiamės atsakyti į visus užklausamus per 24 valandas. Skubiais atvejais skambinkite telefonu.
                </p>
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Ekspertai prieinami dabar</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
