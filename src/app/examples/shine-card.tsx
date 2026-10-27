import { ExampleScreen } from "@/components/ui/example-screen";
import { ShineCard } from "@/components/shine-card";
const _size: number = 350;
const _image: string = `https://i.pinimg.com/1200x/56/6a/9b/566a9b60f21687cb4275f647c045c32e.jpg`;
function ShineCardExample() {
  return (
    <ExampleScreen centered>
      <ShineCard
        source={_image}
        config={{ radius: 32 }}
        style={{
          width: _size,
          height: _size,
        }}
      />
    </ExampleScreen>
  );
}

export default ShineCardExample;
