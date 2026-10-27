import { StyleSheet } from "react-native";

import { ExampleScreen } from "@/components/ui/example-screen";
import { StretchCarousel } from "@/components/stretch-carousel";

const PHOTOS: string[] = [
  "https://i.pinimg.com/1200x/ce/b6/9d/ceb69d6a206db3ad2bce48f1b099ea06.jpg",
  "https://i.pinimg.com/736x/a5/1a/90/a51a90fbebc2a5954e4af0e7971c6aef.jpg",
  "https://i.pinimg.com/736x/88/cb/87/88cb874a00f503b2effe0ee0d315294d.jpg",
  "https://i.pinimg.com/736x/1d/de/e4/1ddee4f08fb20fee87d9520d7398b398.jpg",
];

function StretchCarouselExample() {
  return (
    <ExampleScreen>
      <StretchCarousel
        images={PHOTOS}
        gap={32}
        style={styles.carousel}
        config={{
          blur: 12,
        }}
      />
    </ExampleScreen>
  );
}

const styles = StyleSheet.create({
  carousel: {
    marginVertical: 24,
  },
});

export default StretchCarouselExample;
