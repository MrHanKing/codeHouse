#!/usr/bin/python
# -*- coding:utf-8 -*-

import pygame

# 批量处理图片的透明度
def chulitupian(img):

	color = (255, 255, 255)
	color_alpha = 50
	for x in xrange(img.get_width()):
		for y in xrange(img.get_height()):
			tupian_color = img.get_at((x, y))
			alpha = tupian_color.a
			r1 = int((tupian_color[0] * (100 - color_alpha) + color_alpha * color[0]) / 100)
			g1 = int((tupian_color[1] * (100 - color_alpha) + color_alpha * color[1]) / 100)
			b1 = int((tupian_color[2] * (100 - color_alpha) + color_alpha * color[2]) / 100)
			img.set_at((x, y), (r1, g1, b1) + (alpha,))
	return img

pygame.init()
pygame.display.set_mode()
a = [
	pygame.image.load("btn_mx_bbs2.png").convert_alpha(),
	pygame.image.load("btn_mx_bbs3.png").convert_alpha()
	]
for (i, img) in enumerate(a):
	a = chulitupian(img)
	pygame.image.save(a, "output_%s.png" % i)



