# Generated by Django 3.0.8 on 2021-02-26 20:21

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0007_user_liked_posts'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='liked_posts',
            field=models.ForeignKey(default=False, on_delete=django.db.models.deletion.PROTECT, related_name='liked_by', to='network.Post'),
        ),
    ]
