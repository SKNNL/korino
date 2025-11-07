import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Package,
  Search,
  Heart,
  MessageCircle,
  ArrowRight,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingStep {
  icon: React.ElementType;
  title: string;
  description: string;
}

const steps: OnboardingStep[] = [
  {
    icon: Package,
    title: "Ajoutez vos objets",
    description:
      "Commencez par ajouter les objets que vous souhaitez échanger. Prenez une belle photo et ajoutez une description.",
  },
  {
    icon: Search,
    title: "Découvrez des objets",
    description:
      "Parcourez les objets disponibles en swipant. Glissez à droite si un objet vous intéresse, à gauche sinon.",
  },
  {
    icon: Heart,
    title: "Créez des matches",
    description:
      "Quand deux personnes s'intéressent mutuellement aux objets de l'autre, c'est un match !",
  },
  {
    icon: MessageCircle,
    title: "Discutez et échangez",
    description:
      "Une fois le match créé, discutez pour organiser l'échange. C'est aussi simple que ça !",
  },
];

const OnboardingTutorial = () => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has seen the tutorial
    const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");
    
    if (!hasSeenTutorial) {
      // Delay to let the page load
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("hasSeenTutorial", "true");
    setOpen(false);
    setCurrentStep(0);
  };

  const handleSkip = () => {
    localStorage.setItem("hasSeenTutorial", "true");
    setOpen(false);
    setCurrentStep(0);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4"
          onClick={handleSkip}
        >
          <X className="h-4 w-4" />
        </Button>

        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            Bienvenue sur Koino ! 🎉
          </DialogTitle>
          <DialogDescription className="text-center">
            Découvrez comment échanger vos objets
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <Progress value={progress} className="mb-6" />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="h-10 w-10 text-primary" />
                </div>
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">
                  {currentStepData.title}
                </h3>
                <p className="text-muted-foreground">
                  {currentStepData.description}
                </p>
              </div>

              {/* Step indicators */}
              <div className="flex justify-center gap-2 pt-4">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      index === currentStep
                        ? "bg-primary"
                        : index < currentStep
                        ? "bg-primary/50"
                        : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex gap-2">
          {currentStep > 0 && (
            <Button variant="outline" onClick={handlePrevious} className="flex-1">
              Précédent
            </Button>
          )}
          <Button onClick={handleNext} className="flex-1 gap-2">
            {currentStep === steps.length - 1 ? (
              "Commencer"
            ) : (
              <>
                Suivant
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        <button
          onClick={handleSkip}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
        >
          Passer le tutoriel
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingTutorial;
