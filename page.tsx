
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { fetchUserProfile, fetchStoreCharacters, purchaseCharacter, fetchStudentCurrentCharacter } from '@/lib/api';
import type { User } from '@/types/auth';
import type { Character, StoreCharacterData, CharacterType } from '@/types/entities';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Coins, ShoppingCart, CheckCircle, Sparkles, VenetianMask, ShieldQuestion, UserCircle as UserIconLucide } from 'lucide-react'; // Renamed UserIcon to UserIconLucide
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';

// Dynamically import ModelViewer to avoid SSR issues with three.js
const ModelViewer = dynamic(() => import('@/components/store/ModelViewer'), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-[200px] md:h-[300px] rounded-lg" />,
});


export default function StorePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);
  const [storeCharacters, setStoreCharacters] = useState<StoreCharacterData>({});
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      const currentUser = await fetchUserProfile();
      if (currentUser) {
        if (currentUser.role === 'STUDENT') {
          setUser(currentUser);
          const [sChars, char] = await Promise.all([
            fetchStoreCharacters(),
            fetchStudentCurrentCharacter(currentUser.id)
          ]);
          setStoreCharacters(sChars);
          setCurrentCharacter(char);
        } else {
          router.push('/dashboard'); 
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    }
    loadInitialData();
  }, [router]);

  const handlePurchase = async (character: Character) => {
    if (!user || !user.id) return;
    setPurchasingId(character.id);
    try {
      const response = await purchaseCharacter(user.id, character.id, character.price);
      if (response.success && response.updatedUser) {
        setUser(response.updatedUser); 
        setCurrentCharacter(character); 
        toast({
          title: "¡Compra Exitosa!",
          description: `${character.name} ahora es tu avatar.`,
        });
      } else {
        toast({
          title: "Error en la Compra",
          description: response.message || "No se pudo completar la compra.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error de Red",
        description: "Ocurrió un error. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setPurchasingId(null);
    }
  };

  const getCharacterTypeIcon = (type: CharacterType) => {
    switch (type) {
      case 'ANIMAL': return <VenetianMask className="mr-2 h-5 w-5" />;
      case 'HUMAN': return <UserIconLucide className="mr-2 h-5 w-5" />; // Use renamed import
      default: return <ShieldQuestion className="mr-2 h-5 w-5" />;
    }
  };


  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-card rounded-lg shadow-md">
            <Skeleton className="h-12 w-2/3 sm:w-1/3" />
            <Skeleton className="h-10 w-1/2 sm:w-1/4" />
        </div>
        <Skeleton className="h-48 w-full rounded-lg" /> {/* Current character skeleton */}
        <Skeleton className="h-10 w-1/3 mb-4" /> {/* TabsList skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="shadow-md">
              <CardHeader className="p-0"> <Skeleton className="aspect-square w-full rounded-t-lg" /> </CardHeader>
              <CardContent className="pt-4 space-y-1">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
              <CardFooter className="flex-col items-stretch gap-2 pt-3 border-t">
                <Skeleton className="h-6 w-1/3 mx-auto" />
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return <p className="text-center text-muted-foreground">Debes ser un estudiante para acceder a la tienda.</p>;
  }
  
  const characterTypes = Object.keys(storeCharacters) as CharacterType[];

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-card rounded-lg shadow-md">
        <div>
          <h1 className="text-3xl font-headline text-primary flex items-center">
            <ShoppingCart className="mr-3 h-8 w-8" /> Tienda de Personajes
          </h1>
          <p className="text-muted-foreground mt-1">Usa tus monedas para adquirir nuevos avatares y personalizar tu experiencia.</p>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 text-primary font-semibold">
          <Coins className="h-6 w-6" />
          <span>{user.coin_available || 0} Monedas Disponibles</span>
        </div>
      </header>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-4 sticky top-20">
            <Card className="bg-accent/10 border-accent shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-accent-foreground flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 text-accent"/> Tu Avatar Actual
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                 <div className="w-full h-[300px] md:h-[350px] rounded-lg overflow-hidden bg-muted flex items-center justify-center shadow-inner">
                    {currentCharacter && currentCharacter.modelUrl ? (
                         <ModelViewer url={currentCharacter.modelUrl} height={350} />
                    ) : (
                        <Skeleton className="w-full h-full" />
                    )}
                </div>
                <div>
                    <h3 className="text-2xl font-semibold text-foreground text-center">{currentCharacter?.name || "Sin Avatar"}</h3>
                    {currentCharacter && <Badge variant="secondary" className="mt-1 block mx-auto w-max">{currentCharacter.type}</Badge>}
                </div>
              </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-2">
            <Tabs defaultValue={characterTypes.length > 0 ? characterTypes[0] : "none"}>
                <TabsList className="grid w-full sm:w-auto sm:grid-cols-maxContent grid-cols-2 mb-6">
                {characterTypes.map(type => (
                    <TabsTrigger key={type} value={type} className="flex items-center">
                    {getCharacterTypeIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
                    </TabsTrigger>
                ))}
                {characterTypes.length === 0 && <TabsTrigger value="none" disabled>No hay categorías</TabsTrigger>}
                </TabsList>
                {characterTypes.map(type => (
                <TabsContent key={type} value={type}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-6">
                    {(storeCharacters[type] || []).map(char => (
                        <Card key={char.id} className="flex flex-col overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                        <CardHeader className="p-0">
                            <div className="aspect-square w-full bg-muted flex items-center justify-center overflow-hidden relative">
                                <ModelViewer url={char.modelUrl} height={200} />
                                {currentCharacter?.id === char.id && (
                                    <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                                        <CheckCircle className="mr-1 h-4 w-4"/> Equipado
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow pt-4 space-y-1">
                            <CardTitle className="text-lg">{char.name}</CardTitle>
                            <CardDescription className="text-xs uppercase">{char.type}</CardDescription>
                        </CardContent>
                        <CardFooter className="flex-col items-stretch gap-2 pt-3 border-t">
                            <div className="flex items-center justify-center text-lg font-semibold text-primary">
                            <Coins className="mr-1.5 h-5 w-5" /> {char.price}
                            </div>
                            <Button 
                            onClick={() => handlePurchase(char)} 
                            disabled={purchasingId === char.id || currentCharacter?.id === char.id || (user.coin_available || 0) < char.price}
                            className="w-full"
                            >
                            {purchasingId === char.id ? "Procesando..." : 
                            currentCharacter?.id === char.id ? "Equipado" : 
                            (user.coin_available || 0) < char.price ? "Monedas insuficientes" :
                            "Comprar Avatar"}
                            </Button>
                        </CardFooter>
                        </Card>
                    ))}
                    </div>
                    {(storeCharacters[type] || []).length === 0 && (
                        <p className="text-center text-muted-foreground py-8">No hay personajes disponibles en esta categoría.</p>
                    )}
                </TabsContent>
                ))}
                {characterTypes.length === 0 && (
                    <TabsContent value="none">
                        <p className="text-center text-muted-foreground py-10 text-lg">La tienda está vacía por el momento. ¡Vuelve pronto!</p>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    </div>
    </div>
  );
}
