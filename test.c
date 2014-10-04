#include <stdio.h>

#define MAX_BRIGHTNESS 4095

int rgb_val_to_vol(int val)
{
  return (int)((float)val / 0xff * MAX_BRIGHTNESS);
}

void set_light_color_at(
  int led,
  unsigned int color
) {
  int ch = 3 * (led - 1) + 1;

  printf("%d: %d\n", ch + 0, rgb_val_to_vol(color >> 16));
  printf("%d: %d\n", ch + 1, rgb_val_to_vol((color >> 8) & 0xff));
  printf("%d: %d\n", ch + 2, rgb_val_to_vol(color & 0xff));
}

int main(void)
{
  set_light_color_at(2, 0xff00ff);
  return 0;
}

