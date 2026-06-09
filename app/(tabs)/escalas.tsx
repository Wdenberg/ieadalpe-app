import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from "react-native";
import * as Notifications from "expo-notifications";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/lib/auth-context";
import { useColors } from "@/hooks/use-colors";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useDocumentDownload } from "@/hooks/use-document-download";
import {
  Search,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
} from "lucide-react-native";
import { escalaService, Escala, ItemEscala } from "@/services/escalaServices";

type FilterType = "todas" | "atual" | "passadas";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ✅ Função helper para formatar data YYYY-MM-DD para DD/MM/YYYY sem sofrer com fuso horário
const formatarDataBr = (dataStr: string) => {
  if (!dataStr) return "";
  const partes = dataStr.split("T")[0].split("-");
  if (partes.length !== 3) return dataStr;
  const [ano, mes, dia] = partes;
  return `${dia}/${mes}/${ano}`;
};

// ✅ Função helper para garantir que o horário não duplique o "h" (ex: "19h" ou "19:00:00")
const formatarHorario = (horarioStr: string) => {
  if (!horarioStr) return "";
  const limpo = horarioStr.toLowerCase().replace("h", "").trim();
  return `${limpo.substring(0, 5)}h`;
};

export default function EscalasScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const { isDownloading, downloadDocument } = useDocumentDownload();

  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [minhasEscalas, setMinhasEscalas] = useState<ItemEscala[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("todas");

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const { escalasGerais, minhasEscalas: dadosAgenda } =
        await escalaService.getDadosEscalas(user.id);

      setEscalas(escalasGerais);
      setMinhasEscalas(dadosAgenda || []);
    } catch (err) {
      console.error("Erro ao carregar dados das Escalas:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();

    const setupNotifications = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") await Notifications.requestPermissionsAsync();
    };
    setupNotifications();

    const channel = escalaService.inscreverEmNovasEscalas((newEscala) => {
      setEscalas((prev) => [newEscala, ...prev]);
      Notifications.scheduleNotificationAsync({
        content: {
          title: "📋 Nova Escala Publicada!",
          body: `A escala "${newEscala.nome}" já está disponível.`,
        },
        trigger: null,
      });
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const handleDownload = async (escala: Escala) => {
    try {
      const cleanPath = escala.arquivo_url.replace("private://", "").trim();
      const nomeSeguro = escala.nome.replace(/\//g, "-");
      const { data, error } = await supabase.storage
        .from("media-private")
        .createSignedUrl(cleanPath, 3600);

      if (error || !data?.signedUrl) throw new Error("Erro ao gerar link");
      await downloadDocument(data.signedUrl, `${nomeSeguro}.pdf`);
    } catch (err) {
      Alert.alert("Erro", "Não foi possível baixar o arquivo.");
    }
  };

  const filteredEscalas = useMemo(() => {
    // Pegando a data local correta para o filtro funcionar perfeitamente
    const hojeDate = new Date();
    const hoje = `${hojeDate.getFullYear()}-${String(hojeDate.getMonth() + 1).padStart(2, "0")}-${String(hojeDate.getDate()).padStart(2, "0")}`;

    return escalas.filter((e) => {
      const matchesSearch = e.nome
        .toLowerCase()
        .includes(searchText.toLowerCase());
      if (filterType === "atual") return matchesSearch && e.atual;
      if (filterType === "passadas") return matchesSearch && e.data_fim < hoje;
      return matchesSearch;
    });
  }, [escalas, filterType, searchText]);

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0 bg-background">
      <ScrollView
        stickyHeaderIndices={[1]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchData} />
        }
      >
        {/* HEADER */}
        <View className="bg-primary pt-12 pb-10 px-6 rounded-b-[40px] shadow-lg">
          <Text className="text-3xl font-extrabold text-white">Escalas</Text>
          <Text className="text-white/80 mt-1">Confira suas escalas</Text>
        </View>

        {/* BARRA DE BUSCA E FILTROS */}
        <View className="px-6 -mt-6">
          <View className="bg-surface p-4 rounded-3xl shadow-sm border border-border gap-4">
            <View className="flex-row items-center bg-background px-4 py-2 rounded-2xl border border-border">
              <Search size={20} color={colors.muted} />
              <TextInput
                className="flex-1 ml-2 text-foreground h-10"
                placeholder="Buscar escala..."
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor={colors.muted}
              />
            </View>

            <View className="flex-row gap-2">
              {["todas", "atual", "passadas"].map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setFilterType(type as FilterType)}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl border items-center",
                    filterType === type
                      ? "bg-primary border-primary"
                      : "bg-background border-border",
                  )}
                >
                  <Text
                    className={cn(
                      "text-xs font-bold capitalize",
                      filterType === type ? "text-white" : "text-muted",
                    )}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View className="px-6 py-6">
          {/* SEÇÃO: MINHAS ESCALAS INDIVIDUAIS */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <Calendar size={20} color={colors.primary} />
              <Text className="text-lg font-bold text-foreground ml-2">
                Minha Agenda
              </Text>
            </View>

            {minhasEscalas.length > 0 ? (
              minhasEscalas.map((item) => (
                <View
                  key={item.id}
                  className="bg-primary/5 border border-primary/10 rounded-2xl p-4 mb-3"
                >
                  <View className="flex-row justify-between mb-2">
                    {/* ✅ Aplicada formatação segura de data */}
                    <Text className="font-bold text-primary">
                      {formatarDataBr(item.data)}
                    </Text>
                    <View className="flex-row items-center">
                      <Clock size={14} color={colors.primary} />
                      {/* ✅ Aplicada formatação segura de horário */}
                      <Text className="text-primary text-xs font-bold ml-1">
                        {formatarHorario(item.horario)}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-foreground font-semibold">
                    {item.igreja}
                  </Text>
                  <Text className="text-muted text-xs mt-1">
                    {item.culto_descricao}
                  </Text>
                </View>
              ))
            ) : (
              <View className="p-8 items-center bg-surface rounded-2xl border border-dashed border-border">
                <Text className="text-muted text-sm italic">
                  Nenhum compromisso agendado.
                </Text>
              </View>
            )}
          </View>

          {/* SEÇÃO: LISTA DE PDFS */}
          <View>
            <View className="flex-row items-center mb-4">
              <FileText size={20} color={colors.primary} />
              <Text className="text-lg font-bold text-foreground ml-2">
                Editais Disponíveis
              </Text>
            </View>

            {filteredEscalas.map((escala) => (
              <View
                key={escala.id}
                className="bg-surface rounded-2xl p-5 border border-border mb-4 shadow-sm"
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1 pr-4">
                    <Text className="text-base font-bold text-foreground leading-5">
                      {escala.nome.toUpperCase()}
                    </Text>
                    {/* ✅ Aplicada formatação segura de data na vigência */}
                    <Text className="text-xs text-muted mt-2">
                      Vigência: {formatarDataBr(escala.data_inicio)} -{" "}
                      {formatarDataBr(escala.data_fim)}
                    </Text>
                  </View>
                  {escala.atual && (
                    <View className="bg-green-500/10 px-2 py-1 rounded-md">
                      <Text className="text-[10px] font-bold text-green-600">
                        ATUAL
                      </Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  onPress={() => handleDownload(escala)}
                  disabled={isDownloading}
                  className={cn(
                    "mt-5 flex-row items-center justify-center py-3 rounded-xl",
                    isDownloading ? "bg-muted" : "bg-primary",
                  )}
                >
                  {isDownloading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <CheckCircle size={18} color="white" />
                      <Text className="text-white font-bold ml-2">
                        Baixar PDF
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
