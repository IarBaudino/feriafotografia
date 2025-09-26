// Analytics simplificado - sin Supabase

export interface PageView {
  id?: string;
  page: string;
  timestamp: string;
  user_agent?: string;
  referrer?: string;
  session_id?: string;
}

export interface AnalyticsStats {
  totalViews: number;
  uniqueVisitors: number;
  pageViews: Record<string, number>;
  dailyViews: number;
  weeklyViews: number;
  monthlyViews: number;
}

// Función para registrar una visita
export const trackPageView = async (page: string) => {
  try {
    const pageView: Omit<PageView, "id"> = {
      page,
      timestamp: new Date().toISOString(),
      user_agent:
        typeof window !== "undefined" ? window.navigator.userAgent : undefined,
      referrer: typeof window !== "undefined" ? document.referrer : undefined,
      session_id:
        typeof window !== "undefined"
          ? sessionStorage.getItem("session_id") || generateSessionId()
          : undefined,
    };

    // Guardar en localStorage para persistencia local
    if (typeof window !== "undefined") {
      const views = JSON.parse(localStorage.getItem("page_views") || "[]");
      views.push(pageView);
      localStorage.setItem("page_views", JSON.stringify(views.slice(-100))); // Mantener solo las últimas 100
    }

    // Analytics simplificado - solo localStorage
    console.log("Analytics guardado en localStorage");
  } catch (error) {
    console.error("Error tracking page view:", error);
  }
};

// Función para obtener estadísticas
export const getAnalyticsStats = async (): Promise<AnalyticsStats> => {
  try {
    // Obtener datos de localStorage
    const localViews =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("page_views") || "[]")
        : [];

    // Analytics simplificado - solo localStorage
    const allViews = localViews;

    // Calcular estadísticas
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const dailyViews = allViews.filter(
      (view) => new Date(view.timestamp) >= today
    ).length;

    const weeklyViews = allViews.filter(
      (view) => new Date(view.timestamp) >= weekAgo
    ).length;

    const monthlyViews = allViews.filter(
      (view) => new Date(view.timestamp) >= monthAgo
    ).length;

    // Contar vistas por página
    const pageViews: Record<string, number> = {};
    allViews.forEach((view) => {
      pageViews[view.page] = (pageViews[view.page] || 0) + 1;
    });

    // Contar visitantes únicos (por session_id)
    const uniqueSessions = new Set(
      allViews.filter((view) => view.session_id).map((view) => view.session_id)
    );

    return {
      totalViews: allViews.length,
      uniqueVisitors: uniqueSessions.size,
      pageViews,
      dailyViews,
      weeklyViews,
      monthlyViews,
    };
  } catch (error) {
    console.error("Error getting analytics stats:", error);
    return {
      totalViews: 0,
      uniqueVisitors: 0,
      pageViews: {},
      dailyViews: 0,
      weeklyViews: 0,
      monthlyViews: 0,
    };
  }
};

// Función para generar ID de sesión
const generateSessionId = (): string => {
  const sessionId =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  if (typeof window !== "undefined") {
    sessionStorage.setItem("session_id", sessionId);
  }
  return sessionId;
};

// Función para obtener estadísticas de contenido
export const getContentStats = async () => {
  try {
    // Analytics simplificado - retornar datos básicos
    const exhibitionsResult = { count: 0 };
    const editionsResult = { count: 0 };
    const teamResult = { count: 0 };
    const eventsResult = { count: 0 };
    const imagesResult = { count: 0 };

    return {
      exhibitions: exhibitionsResult.count || 0,
      editions: editionsResult.count || 0,
      teamMembers: teamResult.count || 0,
      events: eventsResult.count || 0,
      images: imagesResult.count || 0,
    };
  } catch (error) {
    console.error("Error getting content stats:", error);
    return {
      exhibitions: 0,
      editions: 0,
      teamMembers: 0,
      events: 0,
      images: 0,
    };
  }
};
