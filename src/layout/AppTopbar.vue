<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useLayout } from "@/layout/composables/layout";
import { useRouter } from "vue-router";

const { onMenuToggle } = useLayout();

const outsideClickListener = ref(null);
const topBarMenuActive = ref(false);
const router = useRouter();

onMounted(() => {
  bindOutsideClickListener();
});

onBeforeUnmount(() => {
  unbindOutsideClickListener();
});

const onTopBarMenuButton = () => {
  topBarMenuActive.value = !topBarMenuActive.value;
};
const onSettingsClick = () => {
  topBarMenuActive.value = false;
  router.push("/documentation");
};
const topBarMenuClasses = computed(() => {
  return {
    "layout-topbar-menu-mobile-active": topBarMenuActive.value,
  };
});

const bindOutsideClickListener = () => {
  if (!outsideClickListener.value) {
    outsideClickListener.value = (event) => {
      if (isOutsideClicked(event)) {
        topBarMenuActive.value = false;
      }
    };
    document.addEventListener("click", outsideClickListener.value);
  }
};

const unbindOutsideClickListener = () => {
  if (outsideClickListener.value) {
    document.removeEventListener("click", outsideClickListener);
    outsideClickListener.value = null;
  }
};

const isOutsideClicked = (event) => {
  if (!topBarMenuActive.value) return;

  const sidebarEl = document.querySelector(".layout-topbar-menu");
  const topBarEl = document.querySelector(".layout-topbar-menu-button");

  return !(
    sidebarEl.isSameNode(event.target) ||
    sidebarEl.contains(event.target) ||
    topBarEl.isSameNode(event.target) ||
    topBarEl.contains(event.target)
  );
};

</script>

<template>
  <div class="layout-topbar">
    <div class="layout-topbar-logo ml-5" @click="onMenuToggle()">
      <img src="../../public/layout/images/logo.svg" alt="logo" />
      <span>PrefersMin</span>
    </div>

    <button
      class="p-link layout-topbar-menu-button layout-topbar-button"
      @click="onTopBarMenuButton()"
    >
      <i class="pi pi-ellipsis-v"></i>
    </button>

    <div class="layout-topbar-menu" :class="topBarMenuClasses">
      <button @click="onTopBarMenuButton()" class="p-link layout-topbar-button">
        <i class="pi pi-calendar"></i>
        <span>Calendar</span>
      </button>
      <button @click="onTopBarMenuButton()" class="p-link layout-topbar-button">
        <i class="pi pi-user"></i>
        <span>Profile</span>
      </button>
      <button @click="onSettingsClick()" class="p-link layout-topbar-button">
        <i class="pi pi-cog"></i>
        <span>Settings</span>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
