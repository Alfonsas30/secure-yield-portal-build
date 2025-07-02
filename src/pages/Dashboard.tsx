import { UserProfile } from "@/components/auth/UserProfile";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Mano paskyra
            </h1>
            <p className="text-slate-600">
              Valdykite savo banko sąskaitos informaciją
            </p>
          </div>
          
          <UserProfile />
        </div>
      </div>
    </ProtectedRoute>
  );
}